/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package gov.usgs.cida.iplover.rest;

import gov.usgs.cida.iplover.util.IploverAuth;
import javax.ws.rs.Consumes;
import javax.ws.rs.FormParam;
import javax.ws.rs.GET;
import javax.ws.rs.HeaderParam;
import javax.ws.rs.NotAuthorizedException;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

/**
 *
 * @author lwinslow
 */
@Path("v2")
public class LoginAuthService {
    
    IploverAuth auth = new IploverAuth();
    
    @POST
    @Path("auth")
    @Consumes(MediaType.APPLICATION_FORM_URLENCODED)
    @Produces(MediaType.APPLICATION_JSON)
    public Response doAuth(@FormParam("username") String username, 
                            @FormParam("password") String password) {
        
        //Check username pass, reply with 200 or 401
        String token;
        String group;
        try{
            token = auth.auth(username, password);
            group = auth.getIploverGroup(token);
        }catch(NotAuthorizedException nae){
            return Response.status(401).entity("Check username and password").build();
        }
        
        String json = "{\"group\":\"" + group + "\",\"auth-token\":\"" + token + "\"}";
        
        //Returns JSON user_group and auth-token in it
        return Response.status(200).entity(json).build();
    }
    
}
