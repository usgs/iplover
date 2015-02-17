package gov.usgs.cida.iplover;


public class IploverRecord {
    
    public String site_id;
    public String client_version;
    
    //All location information
    public double locatoin_lat;
    public double location_lon;
    public double location_accuracy;
    public double location_z;
    
    //All the site metadata fields
    public String density;
    public String setting;
    public String substrate;
    public String vegetation;
    public String image_file_url;
    public String nest_init;
    public String notes;
    
}
