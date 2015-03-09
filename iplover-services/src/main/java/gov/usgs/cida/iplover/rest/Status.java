/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package gov.usgs.cida.iplover.rest;

import com.amazonaws.services.s3.AmazonS3;
import gov.usgs.cida.iplover.util.ImageStorage;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

/**
 *
 * @author lwinslow
 */
@Path("v2")
public class Status {
    @GET
    @Path("status")
    @Produces(MediaType.TEXT_PLAIN)
    public Response getStatus() {
        String status = "";    
        
        status = status + "Creating S3 Client\n";
        AmazonS3 tmp = ImageStorage.prepS3Client();
        status = status + "Client created\n";
        
        
        
        status = status + "All is well.";
        return Response.status(200).entity(status).build();
    }    
}
