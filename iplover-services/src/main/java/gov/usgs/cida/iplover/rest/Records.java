package gov.usgs.cida.iplover.rest;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.github.ooxi.jdatauri.DataUri;
import gov.usgs.cida.iplover.dao.SiteRecordDao;
import gov.usgs.cida.iplover.model.IploverRecord;
import gov.usgs.cida.iplover.util.ImageStorage;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.io.PrintWriter;
import java.security.cert.X509Certificate;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Enumeration;
import java.util.Hashtable;
import javax.naming.InitialContext;
import javax.naming.NamingException;
import javax.servlet.http.HttpServletRequest;
import javax.sql.DataSource;
import javax.ws.rs.Consumes;
import javax.ws.rs.FormParam;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.PUT;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Request;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.SecurityContext;
import javax.ws.rs.core.UriInfo;
import org.apache.commons.lang.RandomStringUtils;
import org.apache.log4j.Logger;
import gov.usgs.cida.iplover.util.MyBatisConnectionFactory;
import java.util.HashMap;
import java.util.List;
import javax.ws.rs.PathParam;
import org.apache.ibatis.session.SqlSession;
import org.apache.ibatis.session.SqlSessionFactory;

/**
*
* @author lawinslow
*/
@Path("v2")
public class Records {
    
    private final static Logger LOG = Logger.getLogger(Records.class);
    
    SimpleDateFormat simp = new SimpleDateFormat("yyyy-MM-dd");
    SimpleDateFormat timestamp = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
    

    
    /**
    * Returns all records stored belonging to user's collection group
    * 
     * @return 
    */
    @GET
    @Path("records")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getAllRecords() {
        
        SiteRecordDao dao = new SiteRecordDao();
        //TODO: Get user group and use it
        List<IploverRecord> records = dao.getAllByGroup("iplover-root");
        
        String output;
        
        try{
            ObjectMapper mapper = new ObjectMapper();
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
    public Response insertRecord(String json) {
        
        ObjectMapper mapper = new ObjectMapper();
        IploverRecord record = null;
        String output;
        
        //Parse posted jSON
        try{
             record = mapper.readValue(json, IploverRecord.class);
        
        }catch(JsonProcessingException jpe){
            LOG.error(jpe);
            return Response.status(400).entity(jpe.getMessage()).build();
        }catch(IOException ioe){
            LOG.error(ioe);
            return Response.status(500).entity(ioe.getMessage()).build();
        }
                
        if(!record.isvalid()){
            return Response.status(400).entity("Incomplete record posted.").build();
        }
        
        try{
            SiteRecordDao dao = new SiteRecordDao();
            dao.insert(record);
        }catch(org.apache.ibatis.exceptions.PersistenceException ibatise){
            return Response.status(500).entity(ibatise.getMessage()).build();
        }
        
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
        
        //All is well!
        return Response.status(200).build();
    }
    

    @PUT
    @Path("records")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response updateRecord(String json) {
        
        ObjectMapper mapper = new ObjectMapper();
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
            return Response.status(400).entity("No record with supplied UUID to update").build();
        }
        
        //Merge updated info with old record
        oldRecord.mergeNonNull(record);
        
        dao.update(oldRecord);
        
        return Response.status(200).build();
    }

}