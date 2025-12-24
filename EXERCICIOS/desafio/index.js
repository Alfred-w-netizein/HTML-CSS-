const run = () => {
    requestAnimationFrame(run);
    let e = eLems[0];
    const ax = (Math.cos(3 * frm) * rad * width) / height;
    const ay = (Math.sin(4 * frm) * rad * height) / width;
    e.x += (ax - pointer.x - e.x) / 10;
    e.y += (ay - pointer.y - e.y) / 10;
    for (let i = 1; i < N; i++) {
        let e = eLems[i];
        let ep = eLems[i - 1];
        const a = Math.atan2(ep.y - e.y, ep.x - e.x);
        e.x += (ep.x - e.x + (Math.cos(a) * (100 - i)) / 5) / 4;
        e.y += (ep.y - e.y + (Math.sin(a) * (100 - i)) / 5) / 4;
        const sc = (162 - 4 * (i - 1)) / 50;
        e.use.setAttributeNS(
            null,
            "transform",
            `translate(${(ep.x + e.x) / 2},${(ep.y + e.y) / 2}) rotate(${(180 / Math.PI) * a})`
        );
    }
};
