/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package gov.usgs.cida.iplover.util;


import java.io.InputStream;

import org.apache.ibatis.io.Resources;
import org.apache.ibatis.session.SqlSessionFactory;
import org.apache.ibatis.session.SqlSessionFactoryBuilder;
import org.apache.log4j.Logger;


/**
 *
 * @author isuftin
 */
public class MyBatisConnectionFactory {

    private static final Logger log = Logger.getLogger(MyBatisConnectionFactory.class);
    private static SqlSessionFactory sqlSessionFactory;
    private final static String RESOURCE = "mybatis-config.xml";
    
    
    static SqlSessionFactory createSessionFactory() {
    	SqlSessionFactory sqlSessionFactory = null;
        try (InputStream inputStream = Resources.getResourceAsStream(RESOURCE)) {
        	sqlSessionFactory = new SqlSessionFactoryBuilder().build(inputStream);
            if (sqlSessionFactory==null) {
            	throw new NullPointerException("SqlSessionFactory was not created.");
            }
            log.info("Created a new SqlSessionFactory");
        } catch (Exception ex) {
            log.error("Error initializing SqlSessionFactoryBuilder", ex);
        }
        return sqlSessionFactory;
    }
    

    public static SqlSessionFactory getSqlSessionFactory() {
        if (sqlSessionFactory==null) {
        	sqlSessionFactory = createSessionFactory();
        }
        return sqlSessionFactory;
    }
}