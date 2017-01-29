import {key_pressed} from "../models/key_pressed";
import {player_keyset} from "../models/player_keyset";




//import 'rxjs/add/operator/map';
//import {server_return} from "./server_return";
//@Injectable()
export /**
 * game_service
 */

class game_service {
    standart_y:number[];
    wind_bootom_position:number;
    wind_length:number;
    game_state:string='run';
    play_end:string='ma2-2.wav';
    
    play_bg:any ;
    current_keymap:key_pressed[]=[];
    gameserverurl:'localhost:8080';  
    //server_return:{};  
    constructor() {//
        
    }


    init_standart_y(fromn:number,to:number){
    //zero_y_arr:= 
    //Math.rand
    }
    provide_figure_y(){

    }
    fill_keymap(e:any){
        for (let i =0;i<this.current_keymap.length;i++){
            if (this.current_keymap[i].keyCode==e.keyCode && e.type=='keydown') this.current_keymap[i].pressed=true;
            if (this.current_keymap[i].keyCode==e.keyCode && e.type=='keyup') this.current_keymap[i].pressed=false;
        }
    }
    fill_keymap_gamepad(){
    var gp = navigator.getGamepads()[0];    
    //var axeLF = gp.axes[0];
    //console.log('l'+gp.axes[1]);
    if(gp.buttons[1].pressed) {
        this.current_keymap[0].pressed=true;
        this.current_keymap[1].pressed=false;
        
    } else if(gp.buttons[2].pressed) {
        this.current_keymap[0].pressed=false;
        this.current_keymap[1].pressed=true;
    }
    else {
        this.current_keymap[0].pressed=false;
        this.current_keymap[1].pressed=false;
    }

if(gp.buttons[0].pressed) {
        this.current_keymap[2].pressed=true;
        this.current_keymap[3].pressed=false;
        
    } else if(gp.buttons[3].pressed) {
        this.current_keymap[2].pressed=false;
        this.current_keymap[3].pressed=true;
    }
    else {
        this.current_keymap[2].pressed=false;
        this.current_keymap[3].pressed=false;
    }    
    
    }
    init_keymap(player_keyset:player_keyset){
        //this.current_keymap = new Array(new key_pressed(player_keyset.left,false),new key_pressed(player_keyset.right,false),new key_pressed(player_keyset.up,false)
        //,new key_pressed(player_keyset.down,false),new key_pressed(player_keyset.down,false),new key_pressed(player_keyset.fire,false));
        this.current_keymap.push(new key_pressed(player_keyset.left,false)); 
        this.current_keymap.push(new key_pressed(player_keyset.right,false));
        this.current_keymap.push(new key_pressed(player_keyset.up,false));
        this.current_keymap.push(new key_pressed(player_keyset.down,false));
        this.current_keymap.push(new key_pressed(player_keyset.fire,false));
    }


      
    
}