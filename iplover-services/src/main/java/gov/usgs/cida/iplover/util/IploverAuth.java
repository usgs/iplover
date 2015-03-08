/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package gov.usgs.cida.iplover.util;

import gov.usgs.cida.auth.client.IAuthClient;
import gov.usgs.cida.auth.model.AuthToken;
import gov.usgs.cida.iplover.auth.CrowdAuth;
import java.util.List;

/**
 *
 * @author lwinslow
 */
public class IploverAuth {
    
    private IAuthClient authService = new CrowdAuth();
    
    public String auth(String username, String password){
        
        AuthToken token = authService.getNewToken(username, password);
        
        return token.getTokenId();
    }
    
    public boolean isAuthenticated(String token){
        return authService.isValidToken(token);
    }
    
    
    public String getIploverGroup(String token){
        String group = null;
        
        List<String> roles = authService.getRolesByToken(token);
        if(roles.size() > 0){
            group = roles.get(0);
        }
        
        return group;
    }
}
