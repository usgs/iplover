/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package gov.usgs.cida.iplover.rest;

import javax.ws.rs.Consumes;
import javax.ws.rs.GET;
import javax.ws.rs.PUT;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import org.apache.log4j.Logger;

/**
 *
 * @author lwinslow
 */
@Path("v2")
public class Pictures {
    
    private final static Logger LOG = Logger.getLogger(Records.class);
    
    
    @GET
    @Path("photos/{uuid}")
    @Produces(MediaType.APPLICATION_OCTET_STREAM)
    public Response updateRecord(@PathParam("uuid") String uuid) {
        
        return Response.status(500).entity("Not implemented").build();
    }

}
