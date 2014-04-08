package gov.usgs.cida.iplover;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import org.apache.commons.fileupload.FileUploadException;
import org.apache.commons.io.FileUtils;
//import org.slf4j.LoggerFactory;

@Path("v1")
public class iploverService {

	@GET
	@Produces(MediaType.TEXT_HTML)
	public String helloWorld(){
		return "Hello world v1";
	}
}
