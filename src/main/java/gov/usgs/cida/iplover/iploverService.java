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
import java.util.Hashtable;
import javax.naming.InitialContext;
import javax.naming.NamingException;
import javax.sql.DataSource;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import org.json.JSONArray;
import org.json.JSONObject;
import org.json.JSONTokener;

//import org.slf4j.LoggerFactory;

@Path("v1")
public class iploverService {

    int uploadNum = 0;
    
    private static final String UPLOAD_HERE  = "/opt/tomcat/images/";

    
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
    public Response methodImCalling(String json) throws FileNotFoundException, IOException {
        
        JSONObject upload = (JSONObject) new JSONTokener(json).nextValue();
        String image = upload.getString("image");
        JSONArray data = (JSONArray) upload.get("data");
        JSONObject site = (JSONObject)data.get(0);
        
        System.out.println(site.get("value"));
        
        Hashtable<String, String> alldata = new Hashtable<String, String>();
        
        for(int i=0; i< data.length(); i++){
            alldata.put(((JSONObject)data.get(i)).optString("name"), 
                    (String)((JSONObject)data.get(i)).optString("value"));
        }
        
        System.out.println(alldata);
        
        //System.out.println(image);
        
        PrintWriter out = new PrintWriter(UPLOAD_HERE+uploadNum+"data.txt");
        out.println(alldata.toString());
        out.close();
        
        DataUri parsedImage = DataUri.parse(image, java.nio.charset.StandardCharsets.UTF_8);
        java.io.FileOutputStream fout = new java.io.FileOutputStream(UPLOAD_HERE+uploadNum+"test.jpg");
        
        org.apache.commons.io.IOUtils.write(parsedImage.getData(), fout);
        fout.close();
        
        uploadNum = uploadNum + 1;
        
        
        /*String filePath = UPLOAD_HERE + contentDispositionHeader.getFileName();
        saveFile(fileInputStream, filePath);

        String output = "File saved to server location : " + filePath;
        
        */
        
        
        return Response.status(200).entity(site.get("value")+" Inserted").build();

    }
    
    private void saveFile(InputStream uploadedInputStream,
                    String serverLocation) {

            try {
                    OutputStream outpuStream = new FileOutputStream(new File(serverLocation));
                    int read = 0;
                    byte[] bytes = new byte[1024];

                    outpuStream = new FileOutputStream(new File(serverLocation));
                    while ((read = uploadedInputStream.read(bytes)) != -1) {
                            outpuStream.write(bytes, 0, read);
                    }
                    outpuStream.flush();
                    outpuStream.close();
            } catch (IOException e) {

                    e.printStackTrace();
            }

    }
    
        
}
