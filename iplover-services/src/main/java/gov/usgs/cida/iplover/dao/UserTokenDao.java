/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package gov.usgs.cida.iplover.dao;

import gov.usgs.cida.iplover.model.UserToken;
import gov.usgs.cida.iplover.util.MyBatisConnectionFactory;
import org.apache.ibatis.session.SqlSession;
import org.apache.ibatis.session.SqlSessionFactory;

/**
 *
 * @author lwinslow
 */
public class UserTokenDao {
    
    private final SqlSessionFactory sqlSessionFactory;
    
    public UserTokenDao() {
        sqlSessionFactory = MyBatisConnectionFactory.getSqlSessionFactory();
    }
    
    
    public void insert(UserToken toinsert){
        try (SqlSession session = sqlSessionFactory.openSession(true)) {
            session.insert("gov.usgs.cida.mybatis.mappers.UserToken.insertToken", toinsert);
        }
    }
    
    public UserToken get(String token){
        UserToken res;
        try (SqlSession session = sqlSessionFactory.openSession(true)) {
             res = session.selectOne("gov.usgs.cida.mybatis.mappers.UserToken.getToken", token);
        }
        return res;
    }
    
    public void delete(String token){
        try (SqlSession session = sqlSessionFactory.openSession(true)) {
            session.delete("gov.usgs.cida.mybatis.mappers.UserToken.deleteToken", token);
        }
    }
    
}
