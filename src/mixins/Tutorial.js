class Step {
    constructor(tutorial, options) {
        this.tutorial = tutorial;
        Object.assign(this, options);
    }
}

class Tutorial {
    constructor(options) {
        Object.assign(this, options);
        this.steps = this.steps.map(options => new Step(this, options));
    }
}

export default function(args) {
    let { options, active } = args;
    // Construct tutorial from tutorial data
    let tutorial = new Tutorial(options);
    // Construct mixin
    return {

        data() {
            // Track the index of the current step
            return { tutorialProgress: null, }
        },
        
        computed: {
            currentStep() {
                return tutorial.steps[this.tutorialProgress];
            },
        },

        methods: {
            startTutorial() {
                this.tutorialProgress = 0;
                this.currentStep.start({ vm: this, advance: this.advanceTutorial });
            },
            advanceTutorial() {
                this.currentStep.close({ vm: this });
                this.tutorialProgress += 1;
                this.currentStep.start({ vm: this, advance: this.advanceTutorial });
            },
        },

        created() {
            if (!this[active]) return;
            // Call tutorial hooks
            if (tutorial.created) tutorial.created({ vm: this });
            for (let step of tutorial.steps) {
                if (step.created) step.created({ vm: this });
            }
        },

        mounted() {
            if (!this[active]) return;
            // Call tutorial hooks
            if (tutorial.mounted) tutorial.mounted({ vm: this });
            for (let step of tutorial.steps) {
                if (step.mounted) step.mounted({ vm: this });
            }
        },

    };
}