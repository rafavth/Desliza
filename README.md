
# Desliza

Lightweight vanilla javascript carousel. Free for personal and commercial use.

## Install

```html
<div class="desliza">
    <div>Content</div>
    <div>Content</div>
    <div>Content</div>
    <div>Content</div>
</div> 
```

```js
<script src="desliza.min.js"></script>
<script> 
    new Desliza();
</script>
```

## Options

```js
new Desliza({
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
});
```

Option | Type | Default | Description
------ | ---- | ------- | -----------
selector | string |'.desliza'| Carousel selector.
duration | int | 180 | Transition duration.
easing | string | 'ease-out' | CSS3 easing animation.
items | int | 1 | Number of items in the viewport.
startIndex | int | 0 | Starting item number.
center | boolean | false | Center items.
threshold | int | 15 | Dragging threshold (in px).
draggable | boolean | true | Draggable items.
dots | boolean | false | Current item indicators. (add **desliza.css**)
buttons | boolean | false | Enable Next/Prev arrows. (add **desliza.css**)
onInit | event | {} | Carousel initialization callback.
onChange | event | {} | Before item change callback.
onAfterChange | event | {} | After item change callback.

## API


Method |  Description
------ | -----------
next() | Go to the next item.


```js
const dslz = new desliza();
document.querySelector('.next').addEventListener('click', () => dslz.next());
```
------------

Method |  Description
------ | -----------
prev() | Go to the previous item.

```js
const dslz = new desliza();
document.querySelector('.prev').addEventListener('click', () => dslz.prev());
```

------------

Method |  Description
------ | -----------
moveTo(index) | Go to a specific item.
```js
const dslz = new desliza();
document.querySelector('.moveto').addEventListener('click', () => dslz.moveTo(2));
```

## Browser support

Only modern browsers.