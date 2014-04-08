package gov.usgs.cida.iplover;

import com.sun.jersey.core.header.FormDataContentDisposition;
import com.sun.jersey.multipart.FormDataParam;
import static java.awt.SystemColor.info;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import javax.ws.rs.Consumes;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

//import org.slf4j.LoggerFactory;

@Path("v1")
public class iploverService {

    
    private static final String UPLOAD_HERE  = "D:\\iPlover\\apache-tomcat-7.0.52\\webapps\\iplover\\Test\\";

    @POST
    @Path("imagepost")
    @Consumes(MediaType.MULTIPART_FORM_DATA)
    public Response methodImCalling(@FormDataParam("file") InputStream fileInputStream,
        @FormDataParam("file") FormDataContentDisposition contentDispositionHeader) {

        String filePath = UPLOAD_HERE + contentDispositionHeader.getFileName();

        saveFile(fileInputStream, filePath);


        String output = "File saved to server location : " + filePath;
        return Response.status(200).entity(output).build();

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
