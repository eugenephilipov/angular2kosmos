export /**
 * name
 */
class standard {
    bottom:number;
    right:number;
    def_width:number=1366;
    def_height:number=662;   
    def_top:number=0; 
    def_left:number=0;

    constructor() {
        if (window.innerHeight>this.def_height){ 
            this.bottom=this.def_height;
            this.def_top=(window.innerHeight-this.bottom)/2;
        }
        else {
            this.bottom=window.innerHeight;//document.body.offsetHeight;//659;            
        }
        if (window.innerWidth>this.def_width ) {
            this.right=this.def_width;
            this.def_left=(window.innerWidth-this.right)/2;
        }
        else{ 
        this.right=window.innerWidth;//document.body.offsetWidth;//1366;
        
        }
    }
}