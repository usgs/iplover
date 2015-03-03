/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package gov.usgs.cida.iplover.rest;

import javax.ws.rs.Consumes;
import javax.ws.rs.FormParam;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

/**
 *
 * @author lwinslow
 */
public class LoginAuthService {
    
    @POST
    @Path("auth")
    @Consumes(MediaType.APPLICATION_FORM_URLENCODED)
    @Produces(MediaType.APPLICATION_JSON)
    public Response doAuth(@FormParam("username") String username, 
                            @FormParam("password") String password) {
        
        //Returns JSON with token and user_group in it
        return Response.status(501).entity("Not Implemented").build();
    }
    
    @GET
    @Path("auth/group")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getUserGroup() {
        
        return Response.status(501).entity("Not Implemented").build();
    }
}
