package gov.usgs.cida.iplover.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.util.Date;

@JsonIgnoreProperties({"valid"})
public class IploverRecord {
    
    /**************************************************************************
     * REQUIRED FIELDS
     **************************************************************************/
    public String uuid;
    public String site_id;
    public String client_version;
    public String device_info;
    public String collection_group;
    public boolean deleted;
    public boolean on_server = true;
    public boolean changes_synced = true;
	public Date last_edited;
    
    //All location information
    public Double location_lat;
    public Double location_lon;
    public Double location_accuracy;
    public Double location_zaccuracy;
    public Double location_z;
    public Date   location_timestamp;
    
    //All the site metadata fields
    public String density;
    public String setting;
    public String substrate;
    public String vegetation;
    
    /**************************************************************************
     * /REQUIRED FIELDS
     **************************************************************************/
    
    /**************************************************************************
     * OPTIONAL FIELDS
     **************************************************************************/
    //Optional fields
    public String nest_init;
    public String notes;
    
    /**************************************************************************
     * /OPTIONAL FIELDS
     **************************************************************************/
    
    //other fields
    public String image_fileurl;
    public byte[] image_data;
    public String image_path;
    public String image_key;
    
    public boolean isvalid(){
        
        return site_id != null && client_version != null && uuid != null &&
           location_lat != null && location_lon != null && 
           location_accuracy != null && density != null && 
           setting != null && substrate != null && vegetation != null;
        
    }
    
    public void mergeNonNull(IploverRecord tomerge){
        
        if(tomerge.uuid == null ? this.uuid != null : !tomerge.uuid.equals(this.uuid)){
            throw new IllegalArgumentException("UUID does not match");
        }
        
        //always merge this, no null check
        this.deleted = tomerge.deleted;
        
        if(tomerge.client_version != null){
            this.client_version = tomerge.client_version;
        }
        if(tomerge.site_id != null){
            this.site_id = tomerge.site_id;
        }
        if(tomerge.location_lat != null){
            this.location_lat = tomerge.location_lat;
        }
        if(tomerge.location_lon != null){
            this.location_lon = tomerge.location_lon;
        }
        if(tomerge.location_accuracy != null){
            this.location_accuracy = tomerge.location_accuracy;
        }
        if(tomerge.location_z != null){
            this.location_z = tomerge.location_z;
        }
        if(tomerge.density != null){
            this.density = tomerge.density;
        }
        if(tomerge.setting != null){
            this.setting = tomerge.setting;
        }
        if(tomerge.substrate != null){
            this.substrate = tomerge.substrate;
        }
        if(tomerge.vegetation != null){
            this.vegetation = tomerge.vegetation;
        }
        if(tomerge.nest_init != null){
            this.nest_init = tomerge.nest_init;
        }
        if(tomerge.notes != null){
            this.notes = tomerge.notes;
        }
		if(tomerge.last_edited != null){
            this.last_edited = tomerge.last_edited;
        }
		
        
    }
    

    
}
