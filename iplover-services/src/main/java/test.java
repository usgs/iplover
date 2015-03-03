
import com.amazonaws.auth.AWSCredentials;
import com.amazonaws.auth.profile.ProfileCredentialsProvider;
import gov.usgs.cida.iplover.util.MyBatisConnectionFactory;
import org.apache.ibatis.session.SqlSession;
import org.apache.ibatis.session.SqlSessionFactory;

/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 *
 * @author lwinslow
 */
public class test {
    
    public static void main(String[] args){
        SqlSessionFactory sqlSessionFactory = MyBatisConnectionFactory.getSqlSessionFactory();
        SqlSession session = sqlSessionFactory.openSession(true);
    }
    
}
