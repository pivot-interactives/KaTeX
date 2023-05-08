import buildCommon from "../buildCommon";
import stretchy from "../stretchy";
import {makeEm} from "../units";
import * as html from "../buildHTML";
import * as mml from "../buildMathML";
import defineFunction from "../defineFunction";

defineFunction({
    type: "html",
    names: ["\\ref"],
    props: {
        numArgs: 2,
        argTypes: ["raw", "text"],
        allowedInText: true,
    },
    handler({parser, funcName, token}, args) {
        return {
            type: "html",
            mode: parser.mode,
            id: args[0].string,
            body: args[1],
        };
    },
    htmlBuilder(group, options) {
        const inner = buildCommon.wrapFragment(
            html.buildGroup(group.body, options),
            options,
        );

        let imgShift = 0;

        // Add horizontal padding
        inner.classes.push("boxpad");

        // Add vertical padding
        let topPad = 0;
        let bottomPad = 0;
        let ruleThickness = 0;
        ruleThickness = Math.max(
            options.fontMetrics().fboxrule, // default
            options.minRuleThickness, // User override.
        );
        topPad = options.fontMetrics().fboxsep;
        bottomPad = topPad;

        const img = stretchy.encloseSpan(
            inner,
            "colorbox",
            topPad,
            bottomPad,
            options,
        );
        const ref = buildCommon.makeSpan(["katex-ref"]);
        ref.attributes["data-ref"] = group.id;
        ref.style.position = "absolute";
        ref.style.display = "block";
        ref.style.width = "100%";
        ref.style.height = "100%";
        img.children.push(ref);
        img.style.borderStyle = "solid";
        img.style.borderWidth = makeEm(ruleThickness);
        imgShift = inner.depth + bottomPad;

        img.style.backgroundColor = "white";
        img.style.borderColor = "black";

        const vlist = buildCommon.makeVList(
            {
                positionType: "individualShift",
                children: [
                    // Put the color background behind inner;
                    {type: "elem", elem: img, shift: imgShift},
                    {type: "elem", elem: inner, shift: 0},
                ],
            },
            options,
        );

        return buildCommon.makeSpan(["mord"], [vlist], options);
    },
    mathmlBuilder: (group, options) => {
        return mml.buildExpressionRow(group.body, options);
    },
});
