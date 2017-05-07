import 'pixi.js';

class PixiRenderer {
  constructor(){
    // TODO: resolution option
    this.pixi = new PIXI.Application({width: 1920, height: 1080, resolution: 1/3});
    document.body.appendChild(this.pixi.view);
    this.sprites = {};
  }

  async addImage(label, resource){
    let sprite = new PIXI.Sprite(resource.texture);
    this.sprites[label] = sprite;
    this.pixi.stage.addChild(sprite);
  }

  async _addImageWithOtherSprite(label, resource, guide, offset){
    let sprite = new PIXI.Sprite(resource.texture);

    const that = this.sprites[guide];
    if( that == undefined ){ throw new Error("Sprite named " + guide + " is not exists." ) }

    this.sprites[label] = sprite;
    const index = that.parent.children.indexOf(that);
    that.parent.addChildAt(sprite, index+offset);
  }

  async addImageUnder(label, resource, under){
    return this._addImageWithOtherSprite(label, resource, under, 0);
  }

  async addImageOver(label, resource, over){
    return this._addImageWithOtherSprite(label, resource, over, 1);
  }

  async removeImage(label){
    if( this.sprites[label] ){
      this.pixi.stage.removeChild(this.sprites[label]);
      delete this.sprites[label];
    }
    // TODO: else assertion
  }

  async fade(label, alpha, duration){
    const sprite = this.sprites[label];
    if( sprite ) {
      const startAlpha = sprite.alpha;
      await animate(duration, (rate)=>{
        sprite.alpha = startAlpha + rate * (alpha - startAlpha);
      });
    }
    // TODO: else assertion
  }

  async move(label, left, top, duration){
    const sprite = this.sprites[label];
    if( sprite ) {
      const startX = sprite.x;
      const startY = sprite.y;
      const endX = left || sprite.x;
      const endY = top || sprite.y;

      await animate(duration, (rate)=>{
        sprite.x = startX + rate * (endX - startX);
        sprite.y = startY + rate * (endY - startY);
      });
    }
  }

  async relabel(label, newlabel){
    const sprite = this.sprites[label];
    this.sprites[newlabel] = sprite;
    delete this.sprites[label];
  }

}

// requestAnimationFrame wrapper, callbackは開始時からのdurationをミリ秒で受け取り、終わるとPromiseがresolveされます
async function animate(duration, callback){
  "use strict";
  return new Promise(resolve => {
    if(!(duration > 0)){
      callback(1.0);
      resolve();
      return;
    }
    const start = Date.now();
    const f = ()=> {
      const current = Date.now();
      const delta = current - start;
      if( delta > duration ){
        callback(1.0);
        resolve();
        return;
      }
      callback(delta / duration);

      window.requestAnimationFrame(f);
    };
    f(start);
  }
  );
}

export default PixiRenderer;