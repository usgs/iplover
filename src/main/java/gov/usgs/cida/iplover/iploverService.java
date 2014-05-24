package gov.usgs.cida.iplover;

import com.github.ooxi.jdatauri.DataUri;
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
import javax.ws.rs.GET;
import javax.ws.rs.POST;
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
import org.json.JSONArray;
import org.json.JSONObject;
import org.json.JSONTokener;


@Path("v1")
public class iploverService {

    int uploadNum = 0;
    SimpleDateFormat simp = new SimpleDateFormat("yyyy-MM-dd");
    SimpleDateFormat timestamp = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
    Logger LOG = Logger.getLogger(iploverService.class);
    
    DataSource ds;
    
    @Context
    HttpServletRequest request;
    
    @Context
    SecurityContext secContext;
    

    
    
    private static final String IMAGE_DIR  = 
            System.getProperty("catalina.base") + "/persist/iplover_images";

    public iploverService() throws Exception {
        
        LOG.trace("Getting data source....");
        
        InitialContext cxt = new InitialContext();
        if ( cxt == null ) {
            LOG.error("No context found. Failing.");
            throw new Exception("No Context!");
        }

        ds = (DataSource) cxt.lookup( "java:/comp/env/jdbc/postgres" );

        if ( ds == null ) {
            LOG.error("No data source found. Failing.");
            throw new Exception("Data source not found!");
        }
        
        LOG.trace("Data source init done.");
    }
    

    @GET
    @Path("test")
    public Response test() {
        String str = "";
        
        X509Certificate[] cert = (X509Certificate[])
         request.getAttribute("javax.servlet.request.X509Certificate");
        
        
        if(cert != null && cert.length > 0){
            str = str + "\nHmmm:" + cert[0].getSubjectX500Principal().getName();
        }else{
            str = "Unknown client cert";
        }
        return Response.status(200).entity(str).build();
    }
    
    @POST
    @Path("imagepost")
    public Response methodImCalling(String json) {

        LOG.trace("ImagePost method called");
        
        JSONObject upload = (JSONObject) new JSONTokener(json).nextValue();
        String image = upload.getString("image");
        JSONArray data = (JSONArray) upload.get("data");
        //JSONObject site = (JSONObject)data.get(0);
        
        
        Hashtable<String, String> alldata = new Hashtable<String, String>();
        
        for(int i=0; i< data.length(); i++){
            alldata.put(((JSONObject)data.get(i)).optString("name"), 
                    (String)((JSONObject)data.get(i)).optString("value"));
        }
        
        
        LOG.debug("User posted:" + alldata.toString());
        
        //LOG.debug(alldata.get("vegdens"));
        
        DataUri parsedImage = DataUri.parse(image, java.nio.charset.StandardCharsets.UTF_8);
        
        String site         = alldata.get("site");
        String version      = alldata.get("client-version");
        String notes        = alldata.get("notes");
        String vegtype      = alldata.get("vegtype");
        String setting      = alldata.get("setting");
        String vegdens      = alldata.get("vegdens");
        String substrate    = alldata.get("substrate");
        String usercert;
        Date ts;
        double lat;
        double lon;
        int accuracy;
        
        try{
            lat  = Double.parseDouble(alldata.get("location-lat"));
            lon  = Double.parseDouble(alldata.get("location-lon"));
            accuracy  = Integer.parseInt(alldata.get("location-accuracy"));
        } catch (java.lang.NumberFormatException ex){
            LOG.error("LatLon format failure" + ex.toString());
            return Response.status(400).entity("LatLon format failure").build();
        }
        
        try {
            ts = timestamp.parse(alldata.get("location-timestamp"));
        } catch (ParseException ex) {
            LOG.error("Could not parse timestamp:" + alldata.get("location-timestamp"));
            return Response.status(400).entity("Timestamp unparseable").build();
        }
        
        
        if(!(alldata.containsKey("site") && alldata.containsKey("client-version") &&
                alldata.containsKey("notes") && alldata.containsKey("vegtype") &&
                alldata.containsKey("setting") && alldata.containsKey("vegdens") &&
                alldata.containsKey("substrate"))){
            
            LOG.error("A key field was not included in the JSON.");
            return Response.status(400).entity("Excessive input field length").build();
        }
        
        LOG.trace("Getting Cert info.");
        
        X509Certificate[] cert =
                (X509Certificate[])request.getAttribute("javax.servlet.request.X509Certificate");        
        
        if(cert != null && cert.length > 0){
            
            usercert = cert[0].getSubjectX500Principal().getName();
        }else{
            usercert = "unknown";
        }
        LOG.trace("Found cert info:" + usercert);
        
        //Check length of all string inputs. Must be < 255
        int lim = 255;
        if(site.length() > lim || 
                version.length() > lim ||
                vegtype.length() > lim || 
                setting.length() > lim ||
                vegdens.length() > lim || 
                substrate.length() > lim ){
            // Kick back an excpetion
            return Response.status(400).entity("Excessive input field length").build();
        }
        
            
        String fkey = saveFile(parsedImage);
        
        try {
            //Add insertion code
            //Get DB
            
            LOG.debug("Database conn:" + ds.getConnection().toString());
            LOG.trace("Preparing insert statement.");
            Connection conn = ds.getConnection();
            
            //Create insert query
            PreparedStatement insert = conn.prepareStatement(
                "INSERT INTO entries(usercertid, datetime, latitude, longitude," +
                "accuracy, site, setting, vegtype, notes, clientversion, imagekey," +
                "vegdens, substrate) " +
                "VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)");
            
            
            insert.setString(1, usercert);//userCertID, 
            insert.setDate(2, new java.sql.Date(ts.getTime()));//`datetime`, 
            insert.setDouble(3, lat);//latitude, 
            insert.setDouble(4, lon);//longitude," +
            insert.setDouble(5, (double)accuracy);//accuracy, 
            insert.setString(6, site);//site, 
            insert.setString(7, setting);//setting, 
            insert.setString(8, vegtype);//vegtype, 
            insert.setString(9, notes);//notes, 
            insert.setString(10,version);//clientVersion, 
            insert.setString(11, fkey);//imageKey
            insert.setString(12,vegdens);//vegdens
            insert.setString(13,substrate);//substrate
            LOG.trace("Prepared statement, inserting...");
            
            //Insert row
            insert.execute();
            LOG.debug("Inserted new record.");
            
        } catch (SQLException ex) {
            LOG.error("Error connecting to DB." + ex.getMessage());
            return Response.status(400).entity("DB error.").build();
        }
        
        return Response.status(200).entity(alldata.get("site")+" Inserted").build();

    }
    
    private String saveFile(DataUri parsedImage) {

        Date d = new Date();
        String dateImageDir = IMAGE_DIR + "/" + simp.format(d);
        String fname = RandomStringUtils.randomAlphanumeric(16) + ".jpg";
        
        //Create the directory if it doesn't exist
        (new File(dateImageDir)).mkdirs();
        
        LOG.trace("Setting up image path.");
        try {
            java.io.FileOutputStream fout = 
                    new java.io.FileOutputStream(dateImageDir + "/" + fname);
        
            org.apache.commons.io.IOUtils.write(parsedImage.getData(), fout);
            fout.close();
            LOG.trace("Image written and closed.");
        } catch (IOException e) {
                LOG.error(e.toString());
        }
        
        //The date directory and filename are the "unique key"
        return(simp.format(d) + "/" + fname);
    }
    
        
}
