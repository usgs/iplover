/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

package gov.usgs.cida.iplover;

import com.github.ooxi.jdatauri.DataUri;
import java.io.BufferedReader;
import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.IOException;

/**
 *
 * @author lwinslow
 */
public class Test {
    public static void main(String[] args) throws FileNotFoundException, IOException{
        
        BufferedReader file = new BufferedReader(new FileReader("D:\\filename.txt"));
        
        
        String textfile = file.readLine();
        System.out.println(textfile);
        
        
        DataUri parsedImage = DataUri.parse(textfile, java.nio.charset.StandardCharsets.UTF_8);
        java.io.FileOutputStream fout = new java.io.FileOutputStream("d:/test.jpg");
        
        org.apache.commons.io.IOUtils.write(parsedImage.getData(), fout);
        fout.close();
        
    }
}
