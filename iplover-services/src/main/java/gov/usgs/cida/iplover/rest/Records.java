package gov.usgs.cida.iplover.rest;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.github.ooxi.jdatauri.DataUri;
import gov.usgs.cida.iplover.dao.SiteRecordDao;
import gov.usgs.cida.iplover.model.IploverRecord;
import gov.usgs.cida.iplover.util.ImageStorage;
import gov.usgs.cida.iplover.util.IploverAuth;
import java.io.IOException;
import java.text.SimpleDateFormat;
import javax.ws.rs.Consumes;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.PUT;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import org.apache.log4j.Logger;
import java.text.DateFormat;
import java.util.List;
import javax.ws.rs.HeaderParam;
import javax.ws.rs.NotAuthorizedException;

/**
*
* @author lawinslow
*/
@Path("v2")
public class Records {
    
    private final static Logger LOG = Logger.getLogger(Records.class);
    
    SimpleDateFormat simp = new SimpleDateFormat("yyyy-MM-dd");
    SimpleDateFormat timestamp = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
    
    final DateFormat df = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
    IploverAuth auth = new IploverAuth();

    
    /**
    * Returns all records stored belonging to user's collection group
    * 
     * @return 
    */
    @GET
    @Path("records")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getAllRecords(@HeaderParam("auth-token") String token) {
        
        //Verify auth/group
        String group;
        try{
            group = auth.getIploverGroup(token);
        }catch(NotAuthorizedException nae){
            return Response.status(401).entity("No auth record found, please re-login.").build();
        }
        
        SiteRecordDao dao = new SiteRecordDao();
        //TODO: Get user group and use it
        List<IploverRecord> records = dao.getAllByGroup(group);
        
        String output;
        
        try{
            ObjectMapper mapper = new ObjectMapper();
            mapper.setDateFormat(df);
            output = mapper.writeValueAsString(records);
            
        }catch(JsonProcessingException jpe){
            return Response.status(500).entity(jpe.getMessage()).build();
        }
        
        return Response.status(200).entity(output).build();
    }
    
    
    /**
    * Upload a new record by posting the JSON.
    * 
    * @param json
    * @return 
    */
    @POST
    @Path("records")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response insertRecord(@HeaderParam("auth-token") String token, 
                                String json) {
        
        //Verify auth/group
        String group;
        try{
            group = auth.getIploverGroup(token);
        }catch(NotAuthorizedException nae){
            return Response.status(401).entity("No auth record found, please re-login.").build();
        }
        
        ObjectMapper mapper = new ObjectMapper();
        mapper.setDateFormat(df);
        IploverRecord record = null;
        
        //Parse posted JSON
        try{
            record = mapper.readValue(json, IploverRecord.class);
        
            if(!record.isvalid()){
                return Response.status(400).entity("Incomplete record posted.").build();
            }
            
            //overwrite collection group to prevent potential group corruption
            record.collection_group = group;
            
            SiteRecordDao dao = new SiteRecordDao();
            
            //Check to see if record exists, if it does, delete it
            // and re-insert. This is a result of poor previous communication
            IploverRecord exists = dao.getByUuid(record.uuid);
            if(exists != null){
                dao.deleteByUuid(exists.uuid);
            }
            
            dao.insert(record);
             
        }catch(JsonProcessingException jpe){
            LOG.error(jpe);
            LOG.error(json);
            return Response.status(400).entity(jpe.getMessage()).build();
        }catch(IOException ioe){
            LOG.error(ioe);
            return Response.status(500).entity(ioe.getMessage()).build();
            
        }catch(org.apache.ibatis.exceptions.PersistenceException ibatise){
            LOG.error(ibatise);
            return Response.status(500).entity(ibatise.getMessage()).build();
        }
        
        LOG.info("Check image fileurl to see if we have an image.");
        
        if(!"missing".equals(record.image_fileurl)){
            LOG.info("We have an image. Storing image on AWS.");
            //Strip out image data from JSON and store on AWS
            DataUri parsedImage = DataUri.parse(record.image_fileurl, java.nio.charset.StandardCharsets.UTF_8);

            //Strip the image out of the record once parsed (we return the record later, make it small)
            record.image_fileurl = "";

            try{
                ImageStorage.save(parsedImage.getData(), record.uuid);
            }catch(IOException ioe){
                LOG.error(ioe);
                return Response.status(500).entity("Unable to store submitted image.").build();
            }
        
        }else{
            LOG.info("No Image, skip...");
            record.image_fileurl = "";
        }
        
        record.changes_synced = true;
        record.on_server      = true;
        
        try{
            String output = mapper.writeValueAsString(record);
            return Response.status(200).entity(output).build();
        }catch(JsonProcessingException jpe){
            LOG.error(jpe);
            return Response.status(500).entity("Error parsing output").build();
        }
    }
    

    @PUT
    @Path("records")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response updateRecord(@HeaderParam("auth-token") String token, 
                                String json) {
        
        //Verify auth/group
        String group;
        try{
            group = auth.getIploverGroup(token);
        }catch(NotAuthorizedException nae){
            LOG.debug(nae);
            return Response.status(401).entity("No auth record found, please re-login.").build();
        }
        
        ObjectMapper mapper = new ObjectMapper();
        mapper.setDateFormat(df);
        IploverRecord record = null;
        
        try{
             record = mapper.readValue(json, IploverRecord.class);
             
        }catch(JsonProcessingException jpe){
            LOG.error(jpe);
            return Response.status(400).entity(jpe.getMessage()).build();
        }catch(IOException ioe){
            LOG.error(ioe);
            return Response.status(500).entity(ioe.getMessage()).build();
        }
        
        SiteRecordDao dao = new SiteRecordDao();
        IploverRecord oldRecord = dao.getByUuid(record.uuid);
        
        if(oldRecord == null){
            LOG.warn("400: No record with supplied UUID to update:" + record.uuid);
            return Response.status(400).entity("No record with supplied UUID to update").build();
        }else if(!oldRecord.collection_group.equals(group)){
            LOG.warn("401: Insufficient access rights to edit:" + record.uuid);
            return Response.status(401).entity("Insufficient access rights to edit").build();
        }
        
        //Merge updated info with old record
        oldRecord.mergeNonNull(record);
        
        dao.update(oldRecord);
        
        oldRecord.changes_synced = true;
        oldRecord.on_server      = true;
        
        try{
            String output = mapper.writeValueAsString(oldRecord);
            return Response.status(200).entity(output).build();
        }catch(JsonProcessingException jpe){
            LOG.error(jpe);
            return Response.status(500).entity("Error parsing output").build();
        }
    }

}