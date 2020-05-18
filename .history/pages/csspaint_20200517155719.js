if (typeof registerPaint !== 'undefined') {
    // define a class to implement the paint worklet
    class SampleCSSPaint {
        // ** declare the properties that the class has access to

        // ** fill out the paint function to do the drawing work
        paint(ctx, size, props) {
            ctx.lineWidth = 3;
            ctx.strokeStyle = "blue";

            ctx.beginPasth();
            ctx.moveTo(0,0);
            ctx.lineTo(size.width,size.height);
            ctx.beginStroke();
        }
    }

    // ** register the paint worklet for CSS

}