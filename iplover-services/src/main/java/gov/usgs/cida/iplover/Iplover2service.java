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


/**
*
* @author lawinslow
*/
@Path("v2/record")
@Consumes(MediaType.APPLICATION_JSON)
public class Iplover2Service {
    
    private final static Logger LOG = Logger.getLogger(Iplover2Service.class);
    
    
    /**
    * Returns all records stored belonging to user's collection group
    * 
    */
    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public Response getRecords() {
                
    }
    
    
    
    @POST
    //@Path("postrecord")
    @Consumes(MediaType.APPLICATION_JSON)
    public Response postRecord(
            IploverRecord newRecord
            ) {
    
    
    }
    
    @POST
    @Path("auth")
    @Consumes(MediaType.APPLICATION_FORM_URLENCODED)
    @Produces(MediaType.APPLICATION_JSON)
    public Response doAuth(@FormParam("username") String username, 
                            @FormParam("password") String password) {
                
                
    }
    
    @GET
    @Path("auth/group")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getUserGroup() {
                
    }
    

}