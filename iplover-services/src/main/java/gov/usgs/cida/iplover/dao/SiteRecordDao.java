/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package gov.usgs.cida.iplover.dao;

import gov.usgs.cida.iplover.model.IploverRecord;
import gov.usgs.cida.iplover.util.MyBatisConnectionFactory;
import java.util.List;
import org.apache.ibatis.session.SqlSession;
import org.apache.ibatis.session.SqlSessionFactory;

/**
 *
 * @author lwinslow
 */
public class SiteRecordDao {

    private final String MASTER_GROUP = "iplover-root";
    private final SqlSessionFactory sqlSessionFactory;

    public SiteRecordDao() {
        sqlSessionFactory = MyBatisConnectionFactory.getSqlSessionFactory();
    }
    
    public void insert(IploverRecord record){
        try (SqlSession session = sqlSessionFactory.openSession(true)) {
            session.update("gov.usgs.cida.mybatis.mappers.Records.insertRecord", record);
        }
    }
    
    public void update(IploverRecord record){
        
        try (SqlSession session = sqlSessionFactory.openSession(true)) {
            session.update("gov.usgs.cida.mybatis.mappers.Records.updateRecord", record);
        }
    }
    
    public List<IploverRecord> getAllByGroup(String groupname){
        
        List<IploverRecord> list;
        
        try (SqlSession session = sqlSessionFactory.openSession()) {
            if(groupname.equals(MASTER_GROUP)){
                
                list = session.selectList("gov.usgs.cida.mybatis.mappers.Records.getAll");
                
            }else{
                list = session.selectList("gov.usgs.cida.mybatis.mappers.Records.getAllByGroup", groupname);
            }
        }
        return list;
    }
    
    public IploverRecord getByUuid(String uuid){
        
        IploverRecord record;
        
        try (SqlSession session = sqlSessionFactory.openSession()) {
            record = session.selectOne("gov.usgs.cida.mybatis.mappers.Records.getByUuid", uuid);
        }
        
        return record;
    }
}
