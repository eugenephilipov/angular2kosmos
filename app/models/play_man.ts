import {play_figure} from "./play_figure";
import {player_keyset} from "./player_keyset";
import {key_pressed} from "./key_pressed";
import {standard} from "./standard";
export /**
 * name
 */
class play_man  {
   //move_step_px=30;
   man_play_figure:play_figure;
   weapon_img:string;
   weapon_coord_x:number=0;
   weapon_coord_y:number=0;   
   weapon_length:number;
   weapon_width:number;
   weapon_visibility:string='hidden';
   weapon_shift_left:number;
   weapon_shift_top:number;
   weapon_gan_bullets:number;
   total_scores:number=0;
   live_count:number=25;
   play_shot:string='d7.wav';   
   standard:standard=new standard();
   play_shot_sound=new Audio('d7.wav');
   gamepad:boolean=false;
   server_send:boolean=false;

   init_weapon_img = 'laser.svg';
   init_weapon_length = 7;
   init_weapon_width = 191;
   init_weapon_shift_left = 210;
   init_weapon_shift_top = 63;
   init_weapon_gan_bullets=0;

   blow_img:string='vzriv.svg';
   blow_img_visibility:string='hidden';
   blow_shift_left:number = 90;
   blow_shift_top:number = 6;
   blow_z_index:string='200';
   blow_counter:number=0;
   blow_counter_setvalue:number=5;
   blow_coord_x:number=0;
   blow_coord_y:number=0;
      

   constructor(){
       //this.play_shot_sound=new Audio(this.play_shot);
   }
   weapon_position(){
      this.weapon_coord_x= this.man_play_figure.coord_x + this.weapon_shift_left;
      this.weapon_coord_y= this.man_play_figure.coord_y + this.weapon_shift_top;
      if (this.man_play_figure.visibility=='visible') this.weapon_visibility='visible';
   }
   add_scores(num : number){
       if (this.man_play_figure.visibility=='visible')  this.total_scores+=num;
   }
   show_blow(){
   if (this.blow_counter>0){    
   this.blow_coord_x=this.man_play_figure.coord_x + this.blow_shift_left;
   this.blow_coord_y=this.man_play_figure.coord_y + this.blow_shift_top; 
   }
   }
   check_hide_blow(step:number){
   this.blow_counter=this.blow_counter+step;
   if (this.blow_counter<=0){      
    this.blow_img_visibility='hidden';
    this.blow_counter=0;
    }
   else this.blow_img_visibility='visible';
 
   }
   
   add_live_count(num: number){
       if (num<0) {
              this.blow_counter=this.blow_counter_setvalue;   
       }
       this.live_count+=num;
       if (this.live_count<=0) this.man_play_figure.visibility='hidden';
   }
move_object(keyset:key_pressed[]){
let koef_x=2;
let koef_y=1.5;
        if (this.man_play_figure.movement_type=='keyset'){
            for (var i=0;i<keyset.length;i++){
                if(keyset[i].pressed==true && this.man_play_figure.keyset.down==keyset[i].keyCode && (this.man_play_figure.coord_y-this.man_play_figure.image_sources[this.man_play_figure.current_source_index].step_px)>0) this.man_play_figure.coord_y=this.man_play_figure.coord_y-this.man_play_figure.image_sources[this.man_play_figure.current_source_index].step_px*koef_y; 
                
                if(keyset[i].pressed==true && this.man_play_figure.keyset.up  ==keyset[i].keyCode &&  (this.man_play_figure.coord_y+ this.man_play_figure.image_sources[this.man_play_figure.current_source_index].length )<=this.standard.bottom) 
                this.man_play_figure.coord_y=this.man_play_figure.coord_y+this.man_play_figure.image_sources[this.man_play_figure.current_source_index].step_px*koef_y; 
                
                if(keyset[i].pressed==true && this.man_play_figure.keyset.left==keyset[i].keyCode && (this.man_play_figure.coord_x+ this.man_play_figure.image_sources[this.man_play_figure.current_source_index].width)<=this.standard.right) 
                this.man_play_figure.coord_x=this.man_play_figure.coord_x+this.man_play_figure.image_sources[this.man_play_figure.current_source_index].step_px*koef_x;
                
                if(keyset[i].pressed==true && this.man_play_figure.keyset.right==keyset[i].keyCode && (this.man_play_figure.coord_x-this.man_play_figure.image_sources[this.man_play_figure.current_source_index].step_px*koef_x)>0 ) this.man_play_figure.coord_x=this.man_play_figure.coord_x-this.man_play_figure.image_sources[this.man_play_figure.current_source_index].step_px*koef_x;
                
/*
var gp = navigator.getGamepads()[0];    
    //var axeLF = gp.axes[0];
    //console.log('l'+gp.axes[1]);
    if(gp.buttons[15].pressed) {
        this.current_keymap[0].pressed=true;
        this.current_keymap[1].pressed=false;
        
    }*/
    //var gp = navigator.getGamepads()[0];    

//|| (gp.buttons[4].pressed) || (gp.buttons[4].pressed) && (!gp.buttons[4].pressed)
//&& (!gp.buttons[4].pressed)
                if ((keyset[i].pressed==true && this.man_play_figure.keyset.fire==keyset[i].keyCode) && this.man_play_figure.visibility=='visible' ) {
                    this.weapon_position();
                    this.weapon_visibility='visible';
                    //new Audio(this.play_shot).play();
                    this.play_shot_sound.play();
                    if (this.weapon_gan_bullets>0) this.weapon_gan_bullets--;
                    if (this.weapon_gan_bullets<=0) this.init_gun();
                }
                if (keyset[i].pressed==false && this.man_play_figure.keyset.fire==keyset[i].keyCode  ) this.weapon_visibility='hidden';
            }
        }
    
}

init_gun(){
    
    this.weapon_img = this.init_weapon_img;
    this.weapon_length = this.init_weapon_length;
    this.weapon_width = this.init_weapon_width;
    this.weapon_shift_left = this.init_weapon_shift_left;
    this.weapon_shift_top = this.init_weapon_shift_top;
    this.weapon_gan_bullets=this.init_weapon_gan_bullets;
}

}