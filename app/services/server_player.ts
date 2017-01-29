export 
class server_player {
    ind:number;
    coord_y:number;
    coord_x:number;
    current_source_index:number;
    weapon_img:string;
    weapon_coord_x:number;
    weapon_coord_y:number;   
    weapon_length:number;
    weapon_width:number;
    weapon_visibility:string;
    weapon_shift_left:number;
    weapon_shift_top:number;
    weapon_gan_bullets:number;
    total_scores:number;
    live_count:number;        
    server_marker:string;
    server_leader:boolean; 
    server_operation:string;
    blow_img:string;
    blow_img_visibility:string;
    blow_shift_left:number;
    blow_shift_top:number;
    blow_z_index:string;
    blow_counter:number;
    blow_counter_setvalue:number;
    blow_coord_x:number;
    blow_coord_y:number; 
    nonleader_live_count:number;
    nonleader_total_scores:number;
    nonleader_blow_coord_x:number;
    nonleader_blow_coord_y:number; 
    nonleader_blow_img_visibility:string;
    nonleader_blow_counter:number;
    display_width:number;
    display_height:number;
           
    constructor() {
        
    }

}