require.config({
    paths: {
        'jquery':  `../../node_modules/jquery/dist/jquery.min`,
        'uikit':   `../../node_modules/uikit/dist/js/uikit.min`,
        'tooltip': `../../node_modules/uikit/dist/js/components/tooltip.min`,
        'chosen':  `../../node_modules/chosen-js/chosen.jquery.min`
    },
    shim:  {
        'chosen':  { deps: ['jquery'] },
        'uikit':   { deps: ['jquery'] },
        'tooltip': { deps: ['uikit'] },
    }
});

require(['chosen', 'tooltip'], () => require(['core']));