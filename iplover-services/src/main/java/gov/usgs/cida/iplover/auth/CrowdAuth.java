/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package gov.usgs.cida.iplover.auth;

import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import gov.usgs.cida.auth.client.IAuthClient;
import gov.usgs.cida.auth.model.AuthToken;
import gov.usgs.cida.auth.model.User;
import gov.usgs.cida.config.DynamicReadOnlyProperties;
import gov.usgs.cida.iplover.dao.UserTokenDao;
import gov.usgs.cida.iplover.model.UserToken;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.List;
import java.util.UUID;
import javax.naming.NamingException;
import javax.ws.rs.NotAuthorizedException;
import javax.ws.rs.client.Client;
import javax.ws.rs.client.ClientBuilder;
import javax.ws.rs.client.Entity;
import javax.ws.rs.client.Invocation;
import javax.ws.rs.client.WebTarget;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import org.apache.log4j.Logger;

/**
 *
 * @author lwinslow
 */
public class CrowdAuth implements IAuthClient{
    
    private static final String JNDI_BASIC_AUTH_PARAM_NAME = "auth.http.basic";
    private static final String JNDI_CROWD_URL_PARAM_NAME = "auth.crowd.url";
    public final static String HEADER_TOKEN_NAME = "auth_token";
    private final static Logger LOG = Logger.getLogger(CrowdAuth.class);
    
    private final UserTokenDao userDao = new UserTokenDao();
    private String crowdUrl;
    private String crowdAuth; 
    
    public CrowdAuth(){
        getCrowdInfo();
    }

    public AuthToken getNewToken(String username, String pass) {
        
        User user = authenticate(username, pass.toCharArray(), crowdAuth, crowdUrl);
        
        if(user.getRoles().isEmpty()){
            throw new NotAuthorizedException("User has no roles.");
        }
        
        UserToken newuser = new UserToken();
        Calendar cal = Calendar.getInstance();
        cal.add(Calendar.MONTH, 1);
        newuser.expires = cal.getTime();
        newuser.token = UUID.randomUUID().toString();
        newuser.group = user.getRoles().get(0);
        
        userDao.insert(newuser);
        
        AuthToken token = new AuthToken();
        token.setTokenId(newuser.token);
        token.setRoles(user.getRoles());
        
        return token;
    }

    public AuthToken getToken(String string) {
        throw new UnsupportedOperationException("Not supported yet.");
    }

    public List<String> getRolesByToken(String string) {
        UserToken token = userDao.get(string);
        if(token == null){
            throw new NotAuthorizedException("User not logged in.");
        }
        List<String> out = new ArrayList<String>();
        out.add(token.group);
        return out;
    }

    public boolean isValidToken(String string) {
        UserToken token = userDao.get(string);
        return token != null && token.expires.after(new Date());
    }

    public boolean isValidToken(AuthToken at) {
        UserToken token = userDao.get(at.getTokenId());
        return token != null && token.expires.after(new Date());
    }

    public boolean invalidateToken(AuthToken at) {
        userDao.delete(at.getTokenId());
        return true;
    }

    @Override
    public boolean invalidateToken(String string) {
        userDao.delete(string);
        return true;
    }
    

    private static User authenticate(String username, char[] password, String basicAuth, String url) {
        User user = new User();
        user.setAuthenticated(false);

        Client client = ClientBuilder.newClient();
        WebTarget target = client.target(url).path("authentication");

        LOG.debug("target URI = " + target.getUri());

        Invocation.Builder request = target.
                        queryParam("username", username).
                        request(MediaType.APPLICATION_JSON_TYPE).
                        header("Authorization", basicAuth).
                        header("Content-Type", MediaType.APPLICATION_JSON);

        Response result = request.post(Entity.json("{ \"value\" : \"" + String.valueOf(password) + "\" }"));
        String resultText = result.readEntity(String.class);

        LOG.debug("custom authenticate request result = " + result.getStatus());
        LOG.debug(resultText);

        if (Response.Status.OK.getStatusCode() == result.getStatus()) {
                JsonElement element = new JsonParser().parse(resultText);
                JsonObject object = element.getAsJsonObject();
                user.setUsername(object.getAsJsonPrimitive("name").getAsString());
                user.setGivenName(object.getAsJsonPrimitive("display-name").getAsString());
                user.setEmail(object.getAsJsonPrimitive("email").getAsString());
                user.setAuthenticated(true);
        } else {
                throw new NotAuthorizedException(resultText);
        }

        if (user.isAuthenticated()) {
                target = client.target(url).path("user").path("group").path("direct");
                request = target.
                                queryParam("username", username).
                                request(MediaType.APPLICATION_JSON_TYPE).
                                header("Authorization", basicAuth);

                result = request.get();
                resultText = result.readEntity(String.class);

                LOG.debug("custom authorize request result = " + result.getStatus());
                LOG.debug(resultText);

                if (Response.Status.OK.getStatusCode() == result.getStatus()) {
                        JsonElement element = new JsonParser().parse(resultText);
                        JsonArray groups = element.getAsJsonObject().getAsJsonArray("groups");
                        List<String> roles = new ArrayList<>();
                        for (int i = 0; i < groups.size(); i++) {
                                String groupName = groups.get(i).getAsJsonObject().getAsJsonPrimitive("name").getAsString();
                                LOG.debug("adding group: " + groupName);
                                if(groupName.toLowerCase().contains("iplover")){
                                    roles.add(groupName);
                                }
                        }
                        user.setRoles(roles);
                }
        }

        client.close();

        return user;
    }
    
    private void getCrowdInfo(){
        //grab variables from context
        DynamicReadOnlyProperties props = new DynamicReadOnlyProperties();
        try {
                props.addJNDIContexts();
        } catch (NamingException ex) {
                LOG.error("Error attempting to read JNDI properties.", ex);
        }

        crowdAuth = props.getProperty(JNDI_BASIC_AUTH_PARAM_NAME);
        crowdUrl  = props.getProperty(JNDI_CROWD_URL_PARAM_NAME);
    }
    
}
