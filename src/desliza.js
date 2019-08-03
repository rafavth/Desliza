/*
 * Desliza 1.0
 * MIT License
 */

class Desliza {

    constructor(options) {

        const defaultOptions = {
            selector: '.desliza',
            duration: 180,
            easing: 'ease-out',
            items: 1,
            startIndex: 0,
            center : false,
            threshold: 20,
            draggable : true,
            dots : false,
            buttons : false,
            onInit: () => {},
            onChange: () => {},
            onAfterChange: () => {}
        }

        this.config = Object.assign({}, defaultOptions, options);

        this.element = document.querySelector(this.config.selector);
        
        if (!this.element) { throw new Error('Missing selector'); }
         
        this.innerElements = [].slice.call(this.element.children);
        this.pointerDown = false;
        this.first = true; 

        this.init();
    }

    init(){    
        if (this.config.items > this.innerElements.length) {
            this.config.items = this.innerElements.length;
        }   

        this.innerElements.length <= this.config.startIndex ? 
            this.currentElement = this.innerElements.length : 
            this.currentElement = this.config.startIndex;

        this.buildSlide();
        if (this.config.dots) this.dots(); 
        this.events();
        this.itemMove();
        this.activeElement();
        this.config.onInit.call(this);
    }

    buttons(direction){
        this.buttonDiv = document.createElement('button');
        this.buttonDiv.className = 'dslz-button ' + direction;
        this.element.appendChild(this.buttonDiv); 
       
        this.svgDiv = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        this.svgDiv.classList = 'dslz-button-icon';
        this.svgDiv.setAttribute("viewBox", "0 0 100 100");
        this.buttonDiv.appendChild(this.svgDiv);

        this.pathDiv = document.createElementNS("http://www.w3.org/2000/svg", "path");
        this.pathDiv.setAttribute("d", "M 10,50 L 60,100 L 70,90 L 30,50  L 70,10 L 60,0 Z");
        this.svgDiv.appendChild(this.pathDiv);
        return(this.buttonDiv);
    }

    dots(){
        this.dotsDiv = document.createElement('ol');
        this.dotsDiv.className = 'dslz-dots';
        this.element.appendChild(this.dotsDiv); 
        for (let index = 0; index < this.innerElements.length; index++) {
            this.dotsinnerDiv = document.createElement('li');
            this.dotsinnerDiv.className = `dot d-${index}`;
            this.dotsDiv.appendChild(this.dotsinnerDiv);
            this.dotsinnerDiv.setAttribute('data-number', `${index}`);
        }
    }

    buildSlide(){
        let viewportWidth = 0;
        let style = 0;
        let marginLeft = 0; 
        let marginRight = 0;

        if (!this.container) {

            this.container = document.createElement('div');
            this.container.className = 'dslz-container';
            this.element.appendChild(this.container);
    
            this.viewport = document.createElement('div');
            this.viewport.className = 'dslz-inner';
            this.container.appendChild(this.viewport);

            for (let i = 0;  i < this.innerElements.length; i++) {
                this.viewport.appendChild(this.innerElements[i]);
                let parent = this.innerElements[i].parentNode;
                let wrapper = document.createElement('div');          
                parent.replaceChild(wrapper, this.innerElements[i]);
                wrapper.appendChild(this.innerElements[i]);
                wrapper.className=(`${i}`);
            }
            
        }

        this.element.style.position = 'relative';
        this.container.style.overflow = 'hidden';
        if (this.config.draggable) this.container.style.cursor = 'grab';

        this.innerElementsBuilded = [].slice.call(this.viewport.children);
        this.elementWidth = (100/this.innerElementsBuilded.length);

        for (let i = 0;  i < this.innerElementsBuilded.length; i++) {

            let wrapper = this.viewport.children[i];
            style = window.getComputedStyle(this.innerElementsBuilded[i]);
            marginLeft = parseInt(style.getPropertyValue('margin-left'));
            marginRight = parseInt(style.getPropertyValue('margin-right'));
            wrapper.style.float = 'left';
            (marginLeft || marginRight) ?
                wrapper.style.width = `calc(${100/this.innerElementsBuilded.length}% - ${marginLeft + marginRight}px)` :
                wrapper.style.width = `${100/this.innerElementsBuilded.length}%`;

            this.viewportWidth2 = this.element.offsetWidth;
            const slidesWidth = this.element.offsetWidth;
            viewportWidth += slidesWidth;
           
        }
        
        this.viewport.style.width = `${(viewportWidth/this.config.items)}px`; 

        if (this.config.center) {
            this.viewport.style.marginLeft = `${(this.container.offsetWidth - (viewportWidth*((this.elementWidth/this.config.items)/100)))/2}px`;
        }

    }

    events() {
        window.addEventListener('resize', this.resizeHandler.bind(this));

        document.addEventListener('transitionstart',(e) => {   
            if (e.target.classList[0] == 'dslz-inner') this.moving = true;
        });

        document.addEventListener('transitionend', (e) => {
            if (e.target.classList[0] == 'dslz-inner') {
                this.moving = false;
                if (this.moveItem) this.config.onAfterChange.call(this);           
            }  
        });

        if (this.config.draggable) { 
            this.container.classList.add('draggable');
            this.container.addEventListener("mousedown", this.mousedownHandler.bind(this));
            this.container.addEventListener("mouseup", this.mouseupHandler.bind(this));
            this.container.addEventListener("mousemove", this.mousemoveHandler.bind(this));
            this.container.addEventListener("mouseleave", this.mouseleaveHandler.bind(this));
            this.container.addEventListener('touchstart', this.touchstartHandler.bind(this));
            this.container.addEventListener('touchend', this.touchendHandler.bind(this));
            this.container.addEventListener('touchmove', this.touchmoveHandler.bind(this)); 
        }

        if (this.config.dots) {
            for (let index = 0; index < this.dotsDiv.children.length; index++) {
                this.dotsDiv.children[index].addEventListener("click", this.dotsHandler.bind(this));
            }
        }

        if (this.config.buttons == true) {
            this.buttons('dslz-next').addEventListener('click', () => this.next());
            this.buttons('dslz-prev').addEventListener('click', () => this.prev());
        }
    }

    touchstartHandler(e){
        e.preventDefault();
        if(['INPUT', 'TEXTAREA', 'SELECT','OPTION'].indexOf(e.target.nodeName) !== -1) return false;
        this.pointerDown = true;
        this.start = e.touches[0].pageX;
        this.container.classList.add('touch-start');
    }

    touchmoveHandler(e){
        if (this.pointerDown && !this.moving) {
            this.first = false;
            this.end = e.touches[0].pageX;
            this.movement =  (this.end - this.start);
            if (this.movement != 0) {
                const currentMovement = (this.movement/this.viewportWidth2*100);
                const number = this.currentElement*this.elementWidth;
                const total = -(number) + ((currentMovement/this.innerElementsBuilded.length)*this.config.items);
                this.viewport.style.transition = `all 0ms`;
                this.viewport.style.transform = `translateX(${total.toFixed(2)}%)`;
            }
            
        }
    }
    
    touchendHandler(){
        if (this.movement != 0) { 
            this.itemMove();
            this.movement = 0;      
        }
        this.pointerDown = false;
        this.viewport.classList.remove('touch-start');
    }

    resizeHandler() {
        clearTimeout(window.resizedFinished);
        window.resizedFinished = setTimeout(() => {
            this.buildSlide();
            const total = ((100/this.innerElementsBuilded.length)) * this.currentElement;
            this.viewport.style.transform = `translateX(-${total.toFixed(2)}%)`;
            this.viewport.style.transition = `all 0ms`;
        }, 100);
    }

    dotsHandler(e){
        this.currentElement = parseInt(e.target.dataset.number);
        this.moveTo(this.currentElement);
    }

    prev(){ 
        if (this.currentElement != 0) {
            this.currentElement = this.currentElement - 1;
            this.moveTo(this.currentElement);
        }
    }

    next(){  
        if (this.currentElement != this.innerElements.length - 1) {   
            this.currentElement =  this.currentElement + 1;
            this.moveTo(this.currentElement);
        }
    }

    moveTo(current=this.currentElement){
        this.viewport.style.transition = `all ${this.config.duration}ms ${this.config.easing}`;
        const total = this.elementWidth * current;
        this.currentElement = current;
        this.viewport.style.transform = `translateX(-${total.toFixed(2)}%)`;
        this.config.onChange.call(this);
        this.activeElement();
        this.moveItem = true;
    } 
  
    stay(){   
        this.moveItem = false;     
        if(!this.first) this.viewport.style.transition = `all 200ms ${this.config.easing}`;
        const total = this.elementWidth * this.currentElement;
        this.viewport.style.transform = `translateX(-${total.toFixed(2)}%)`;
        
    }

    mousedownHandler(e){ 
        if(['INPUT', 'TEXTAREA', 'SELECT','OPTION'].indexOf(e.target.nodeName) !== -1) return false;
        e.preventDefault();
        this.pointerDown = true;
        this.start = e.pageX;
        this.viewport.classList.add('mouse-down');
    }

    mouseupHandler(){
        if (this.movement != 0) {
            this.itemMove();
            this.movement = 0;
        }
        this.viewport.classList.remove('mouse-down');
        this.pointerDown = false;
    }

    mouseleaveHandler(){
        if (this.pointerDown) this.mouseupHandler();
    }

    mousemoveHandler(e){
        if (this.pointerDown && !this.moving) {
            this.first = false;
            this.end = e.pageX;
        
            this.movement =  (this.end - this.start);
            const currentMovement = (this.movement/this.viewportWidth2*100);
            const number = this.currentElement*this.elementWidth;
            const total = -(number) + ((currentMovement/this.innerElementsBuilded.length)*this.config.items);

            this.viewport.style.transition = `all 0ms`;
            this.viewport.style.transform = `translateX(${total.toFixed(2)}%)`;
        } 
    }

    itemMove(){
        if (this.movement >= 0) {
            this.currentElement == 0 || Math.abs(this.movement) < this.config.threshold ? 
                this.stay() : this.prev();  
        } else {
            Math.abs(this.movement) > this.config.threshold ? 
                this.currentElement !== this.innerElements.length-1 ? 
                this.next() : this.stay() : this.stay();   
        } 
    }

    activeElement(){
        if (this.config.buttons) {
            this.currentElement == this.innerElements.length-1 ? 
                document.querySelector('.dslz-next').classList.add('disabled') : 
                document.querySelector('.dslz-next').classList.remove('disabled'); 
            this.currentElement == 0 ? 
                document.querySelector('.dslz-prev').classList.add('disabled') : 
                document.querySelector('.dslz-prev').classList.remove('disabled');    
        }

        for (let i = 0;  i < this.innerElements.length; i++) {
            this.currentElement === i ?
                this.innerElements[i].parentNode.classList.add('active') :
                this.innerElements[i].parentNode.classList.remove('active');
        } 
       
        if (this.config.dots) {
            let dotsArray = [].slice.call(this.dotsDiv.children);
            for (let i = 0; i < dotsArray.length; i++) {
                this.currentElement == i ?
                    dotsArray[i].classList.add('selected') :
                    dotsArray[i].classList.remove('selected');
            }
        }
    }

}