package gov.usgs.cida.iplover;

import com.github.ooxi.jdatauri.DataUri;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.io.PrintWriter;
import java.sql.SQLException;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Hashtable;
import java.util.logging.Level;
import java.util.logging.Logger;
import javax.naming.InitialContext;
import javax.naming.NamingException;
import javax.sql.DataSource;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import org.apache.commons.lang.RandomStringUtils;
import org.json.JSONArray;
import org.json.JSONObject;
import org.json.JSONTokener;

//import org.slf4j.LoggerFactory;

@Path("v1")
public class iploverService {

    int uploadNum = 0;
    SimpleDateFormat simp = new SimpleDateFormat("yyyy-MM-dd");
    SimpleDateFormat timestamp = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
    static final Logger logger = Logger.getLogger(iploverService.class.getName());;
    
    private static final String IMAGE_DIR  = 
            System.getProperty("catalina.base") + "/persist/iplover_images";

    public iploverService() {
        
    }
    
    @GET
    @Path("test")
    @Produces(MediaType.TEXT_PLAIN)
    public String methodImCalling() throws NamingException, SQLException{
        	
	
        InitialContext cxt = new InitialContext();
        if ( cxt == null ) {
           return("Uh oh -- no context!");
        }

        DataSource ds = (DataSource) cxt.lookup( "java:/comp/env/jdbc/postgres" );

        if ( ds == null ) {
           return("Data source not found!");
        }
        
        return(ds.getConnection().toString());
    }
    
    @POST
    @Path("imagepost")
    public Response methodImCalling(String json) {
        
        JSONObject upload = (JSONObject) new JSONTokener(json).nextValue();
        String image = upload.getString("image");
        JSONArray data = (JSONArray) upload.get("data");
        //JSONObject site = (JSONObject)data.get(0);
        
        
        Hashtable<String, String> alldata = new Hashtable<String, String>();
        
        for(int i=0; i< data.length(); i++){
            alldata.put(((JSONObject)data.get(i)).optString("name"), 
                    (String)((JSONObject)data.get(i)).optString("value"));
        }
        
        System.out.println(alldata);
        
        //System.out.println(alldata.get("vegdens"));
        
        DataUri parsedImage = DataUri.parse(image, java.nio.charset.StandardCharsets.UTF_8);
        
        String site         = alldata.get("site");
        String version      = alldata.get("client-version");
        String notes        = alldata.get("notes");
        double lat          = Double.parseDouble(alldata.get("location-lat"));
        double lon          = Double.parseDouble(alldata.get("location-lon"));
        String vegtype      = alldata.get("vegtype");
        String beach        = alldata.get("beach");
        String vegdens      = alldata.get("vegdens");
        String substrate    = alldata.get("substrate");
        
        //Check length of all string inputs. Must be < 255
        int lim = 255;
        if(site.length() > lim || version.length() > lim ||
                vegtype.length() > lim || beach.length() > lim ||
                vegdens.length() > lim || substrate.length() > lim ){
            // Kick back an excpetion
            return Response.status(400).entity("Excessive input field length").build();
        }
        
        try {
            Date ts = timestamp.parse(alldata.get("location-timestamp"));
        } catch (ParseException ex) {
            logger.log(Level.WARNING, null, ex);
            return Response.status(400).entity("Timestamp unparseable").build();
        }
            
        String fkey = saveFile(parsedImage);
        
        //Add insertion code
        //Get DB
        
        //Create insert query
        
        //Insert row
        
        
        
        return Response.status(200).entity(alldata.get("site")+" Inserted").build();

    }
    
    private String saveFile(DataUri parsedImage) {

        Date d = new Date();
        String dateImageDir = IMAGE_DIR + "/" + simp.format(d);
        String fname = RandomStringUtils.randomAlphanumeric(16) + ".jpg";
        
        //Create the directory if it doesn't exist
        (new File(dateImageDir)).mkdirs();
        
        
        try {
            
            java.io.FileOutputStream fout = 
                    new java.io.FileOutputStream(dateImageDir + "/" + fname);
        
            org.apache.commons.io.IOUtils.write(parsedImage.getData(), fout);
            fout.close();
            
        } catch (IOException e) {

                e.printStackTrace();
        }
        
        //The date directory and filename are the "unique key"
        return(simp.format(d) + "/" + fname);

    }
    
        
}
