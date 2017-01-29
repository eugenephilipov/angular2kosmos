import {image_obj} from "./image_obj";
import {player_keyset} from "./player_keyset";
import {key_pressed} from "./key_pressed";
import {standard} from "./standard";
export /**
 * basic play figures as 
 */
class play_figure {
    coord_x:number;//
    coord_y:number;//
    bottom:number;
    play_type:string;
    image_sources:image_obj [];
    figure_outline:string;
    visibility:string='visible';
    score:number=100;
    status:string='move';//not used
    current_source_index:number=0;//
    iteration_count:number=0;//current iteration counter after hidding 0
    wait_iterations:number=50;//appereance to wait before last execution, also first appearence wait
    max_appearences:number=0;//how many times to appear 
    appearences_count:number=0;// how many times has been used
    
    reference_indx:number=-1;
    movement_type='line';
    keyset:player_keyset;
    z_index:string='10';
    dom_id:string;
    standard:standard=new standard();
    to_kill:number=1;
    init_killed:number=1;
    ind:number;
    is_used_delta:boolean;
    on_change_next_image: {(): void;};
    on_repeat_object: {(): void;};
    on_move_object: {(figure: play_figure): void;};
    move_obj_current:any;
    element_type='IMG';
    text_val:any='';
    txtstyle:string="txtstyle";
    get_status_pict_count(status:string):number[]{
        var ret_count:number=0;
        var min_ind:number=-1;
        var max_ind:number=-1;
        for (var i=0;i<this.image_sources.length;i++){
            if (status==this.image_sources[i].event){
                ret_count++;
                if (min_ind==-1) min_ind=i;
                if (max_ind<i) max_ind=i;
            } 
        }
    return Array(ret_count,min_ind,max_ind);
    }
    change_next_image():void{
        //let tot_arr:number=this.image_sources.length;
        let images_prop:number[]=this.get_status_pict_count(this.status);
        let tot_arr:number=images_prop[0];
        let min_ind:number=images_prop[1];
        if (tot_arr>1){
        if (this.current_source_index+1<tot_arr) {
            this.image_sources[this.current_source_index].iteration_count=0;
            this.current_source_index++;
            if (this.figure_outline=='dyn') this.set_position_bottom(); // this.coord_y=this.standard.bottom -this.image_sources[this.current_source_index].length;                        
            this.image_sources[this.current_source_index].iteration_count=0;

            }
        else {
            if (this.status=='disappear'){
                this.set_hidden_prop();
            }
            else {
                this.current_source_index=min_ind;
                this.image_sources[this.current_source_index].iteration_count=0;
            }
            if (this.figure_outline=='dyn') this.set_position_bottom(); // this.coord_y=this.standard.bottom -this.image_sources[this.current_source_index].length;
            } 
        }
     else if (this.status=='disappear'){
                this.set_hidden_prop();
            }   
    if (this.on_change_next_image) this.on_change_next_image();
    }
    move_object(keyset:key_pressed[] ,server_x:number){
        if(this.on_move_object) {
            this.on_move_object(this);                        
        }
        else { //start of standard movement handler         
            if (this.movement_type=='server')
            this.coord_x=server_x;
                    
            if (this.movement_type=='line')
            this.coord_x=this.coord_x-this.image_sources[this.current_source_index].step_px;
            if (this.movement_type=='sinus'){
            this.coord_x=this.coord_x-this.image_sources[this.current_source_index].step_px;
            //this.coord_y=290+280*Math.sin(0.01*this.coord_x+0);//y=a+b\sin(cx+d).y=a+b\sin(cx+d).
            this.coord_y = this.standard.bottom/2  + (this.standard.bottom/2 - this.image_sources[this.current_source_index].length)*Math.sin(0.01*this.coord_x+0);
            }
            if (this.movement_type=='cosinus'){
            this.coord_x=this.coord_x-this.image_sources[this.current_source_index].step_px;
            this.coord_y=this.standard.bottom/2  + (this.standard.bottom/2 - this.image_sources[this.current_source_index].length)*Math.cos(0.01*this.coord_x+0);//y=a+b\sin(cx+d).y=a+b\sin(cx+d).
            }
            if (this.movement_type=='parabola'){
            this.coord_x=this.coord_x-this.image_sources[this.current_source_index].step_px;
            this.coord_y=0.0003*(this.coord_x*this.coord_x) + (this.coord_x*.0003)  ;  
            //y=ax^{2}+bx+c}
            }
        }// end of standard movement handler    
        
    }    
    repeat_object(){ 
        if(this.on_repeat_object) {
            this.on_repeat_object();                        
        }
        else {                               
        if (this.iteration_count>=this.wait_iterations && (this.max_appearences>this.appearences_count || this.max_appearences==0) ) {
            this.appearences_count++;
            this.coord_x=this.standard.right -this.image_sources[this.current_source_index].width-5;
            if (this.figure_outline=='dyn') this.set_position_bottom(); // this.coord_y=this.standard.bottom -this.image_sources[this.current_source_index].length;                        
            this.to_kill=this.init_killed;
            this.object_continue_move();
            
        }
        }
    }
    destroy_object(){
    this.to_kill--;        
        if (this.to_kill<=0){
            this.to_kill=0;
            /*
            if (this.figure_outline=='dyn') {
                this.current_source_index=0;
                this.set_position_bottom();
            }
            else*/ 
            this.hide_object();
        }
    }
    set_hidden_prop(){
        this.to_kill=0;
        this.iteration_count=0;
        this.visibility='hidden';
        this.status='nonactive';
        this.current_source_index=0;
        this.image_sources[this.current_source_index].iteration_count=0;                
    }
    hide_object(){
        let images_prop:number[];
        images_prop=this.get_status_pict_count('disappear');
        if ((this.play_type == 'end' || this.play_type == 'dyn') && (images_prop[0]>0)) {            
         this.status='disappear';

        this.current_source_index=images_prop[1];
        this.image_sources[this.current_source_index].iteration_count=0;

        }
        else this.set_hidden_prop();        
    }
    set_position_bottom(){
      
      this.coord_y=this.standard.bottom-this.image_sources[this.current_source_index].length;
    }
    set_position_right(){
      this.coord_x=this.standard.right-this.image_sources[this.current_source_index].width;
    }
    clone_image_obj(from_obj:image_obj,to_obj:image_obj){
        to_obj.width=from_obj.width;
        to_obj.length=from_obj.length;
        to_obj.event=from_obj.event;
        to_obj.source=from_obj.source;
        to_obj.live_iter=from_obj.live_iter;
        to_obj.iteration_count=from_obj.iteration_count;
        to_obj.step_px=from_obj.step_px;   
    }
stop_moving(){
    for (let i:number=0;i<this.image_sources.length;i++)  this.image_sources[i].step_px=0;    
}

object_continue_move(){
    this.visibility='visible';    
    this.status='move';        
}
inactivate(){
    this.status='notacutal';
    this.visibility='hidden';
}
}