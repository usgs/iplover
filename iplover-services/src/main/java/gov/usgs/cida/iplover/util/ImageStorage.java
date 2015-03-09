/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package gov.usgs.cida.iplover.util;

import com.amazonaws.AmazonClientException;
import com.amazonaws.auth.AWSCredentials;
import com.amazonaws.auth.profile.ProfileCredentialsProvider;
import com.amazonaws.regions.Region;
import com.amazonaws.regions.Regions;
import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.AmazonS3Client;
import com.amazonaws.services.s3.model.GetObjectRequest;
import com.amazonaws.services.s3.model.ObjectMetadata;
import com.amazonaws.services.s3.model.S3Object;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.Date;
import org.apache.commons.io.IOUtils;
import org.apache.commons.lang.RandomStringUtils;
import org.apache.log4j.Logger;

/**
 *
 * @author lwinslow
 */
public class ImageStorage {
    
    //logger of course
    public static Logger LOG = Logger.getLogger(ImageStorage.class);
    
    
    public static final String BUCKET_NAME = "owi.private.application.bucket";
    
    //Static location for storing images
    public static final String KEY_BASE  = "iplover/images";
    
    //Date format used for organizing filesystem
    public static SimpleDateFormat simp = new SimpleDateFormat("yyyy-MM-dd");
    
    
    public static String save(byte[] parsedImage, String uuid) throws IOException{

        AmazonS3 s3 = prepS3Client();
        
        ObjectMetadata metadata = new ObjectMetadata();
        metadata.setContentLength(parsedImage.length);
        
        LOG.trace("Setting up image key.");
        //Build key, split by date uploaded
        Date d = new Date();
        String fname = uuid + ".jpg";
        String fileId = simp.format(d) + "/" + fname;
        String fileKey = KEY_BASE + "/" + fileId;
        
        s3.putObject(BUCKET_NAME, fileKey, new ByteArrayInputStream(parsedImage), metadata);
        
        LOG.trace("Image uploaded.");
        
        //The date directory and filename are the "unique key"
        return(fileId);
    }
    
    public static byte[] get(String uuid) throws IOException{
        
        AmazonS3 s3 = prepS3Client();
        
        String imageKey = KEY_BASE + "/" + uuid + ".jpg";
        
        S3Object object = s3.getObject(new GetObjectRequest(BUCKET_NAME, imageKey));
        
        return IOUtils.toByteArray(object.getObjectContent());
    }
    
    public static AmazonS3 prepS3Client(){
        
        AWSCredentials credentials = null;
        try {
            credentials = new ProfileCredentialsProvider().getCredentials();
        } catch (Exception e) {
            throw new AmazonClientException(
                    "Cannot load the credentials from the credential profiles file. " +
                    "Please make sure that your credentials file is at the correct " +
                    "location (~/.aws/credentials), and is in valid format.",
                    e);
        }
        
        AmazonS3 s3 = new AmazonS3Client(credentials);
        Region usWest2 = Region.getRegion(Regions.US_WEST_2);
        s3.setRegion(usWest2);
        
        return s3;
    }
    
}
