import buildCommon from "../buildCommon";
import stretchy from "../stretchy";
import {makeEm} from "../units";
import * as html from "../buildHTML";
import * as mml from "../buildMathML";
import defineFunction from "../defineFunction";

defineFunction({
    type: "enclose",
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

        // Add horizontal padding
        inner.classes.push("boxpad");

        // Add vertical padding
        const padding = options.fontMetrics().fboxsep;

        const img = stretchy.encloseSpan(
            inner,
            "colorbox",
            padding,
            padding,
            options,
        );
        img.style.minWidth = makeEm(1.2);
        img.height = Math.max(img.height, 1.2);
        img.style.height = makeEm(img.height);
        img.attributes["data-ref"] = group.id;
        img.classes.push("katex-ref");

        const vlist = buildCommon.makeVList(
            {
                positionType: "individualShift",
                children: [
                    // Put the color background behind inner;
                    {type: "elem", elem: img, shift: inner.depth + padding},
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
