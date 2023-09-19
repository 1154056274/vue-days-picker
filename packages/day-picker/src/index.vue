<template>
    <div class="vue-day-picker-wrapper">
        <div class="vue-day-picker-input-wrapper" :class="{
            'vue-day-picker-input-wrapper_active': isShow,
            'vue-day-picker-input-wrapper_disabled': disabled,
        }">
            <input readonly id="vue-day-picker-input_start" placeholder="开始日期" @focus="inputFocus"
                v-model="inputVal.start" />
            <span class="vue-day-picker-input_saparate_text" @click="inputFocus">至</span>
            <input readonly id="vue-day-picker-input_end" placeholder="结束日期" @focus="inputFocus" v-model="inputVal.end" />
            <el-icon v-if="inputVal.start && inputVal.end" color="#409EFC" class="vue-day-picker-icon_close" @click="del">
                <Close />
            </el-icon>
            <el-icon v-else color="#409EFC" class="vue-day-picker-icon_timer" @click="inputFocus">
                <Timer />
            </el-icon>
        </div>
        <ul class="vue-day-picker-select-wrapper" id="vue-day-picker-select-wrapper" v-if="isShow">
            <li class="vue-day-picker-select_item" v-for="(item, index) in getItems()" :key="item" :class="{
                active: firstActiveIndex === index || secondActiveIndex === index,
                hoverActive: hoverActive(index),
            }" @mouseover="() => {
    mouseover(index);
}
    " @click="() => {
        selectLi(index);
    }
        ">
                {{ item }}
            </li>
        </ul>
    </div>
</template>

<script setup lang="ts">
import { onMounted, ref, onUnmounted } from "vue";
import { isArray, isEmpty, isObject, max, min } from "lodash";
import { Close, Timer } from "@element-plus/icons";

const DAYS = 31;
const INIT_DATA = -1;
const ZERO = 0;
const DIFF_DATA = 1;

const props = defineProps({
    modelValue: {
        type: Object,
        default: () => {
            return {};
        },
    },
    disabled: {
        type: Boolean,
        default: false,
    },
    format: {
        type: String,
        default: 'object'
    },
    notAllowSameDay: {
        type: Boolean,
        default: false
    }
});

onMounted(() => {
    if (props.modelValue && isArray(props.modelValue) && props.modelValue.length) {
        const start = min(props.modelValue)
        const end = max(props.modelValue)
        inputVal.value = {
            start: start + "号",
            end: end + "号",
        };
        firstActiveIndex.value = start - 1
        secondActiveIndex.value = end - 1
    }
    else if (props.modelValue && isObject(props.modelValue) && !isEmpty(props.modelValue)) {
        const start = props.modelValue.start
        const end = props.modelValue.end
        inputVal.value = {
            start: start + "号",
            end: end + "号",
        };
        firstActiveIndex.value = start - 1
        secondActiveIndex.value = end - 1
    }


});

const emit = defineEmits(["update:modelValue"]);

const inputVal = ref<any>({
    start: "",
    end: "",
});
const isShow = ref(false);

const inputFocus = () => {
    if (props.disabled) return;
    isShow.value = true;
};

const firstActiveIndex = ref(INIT_DATA);
const secondActiveIndex = ref(INIT_DATA);

const hoverItem = ref(INIT_DATA);

const getItems = () => {
    const arr = [] as any;
    for (let i = 1; i <= DAYS; i++) {
        arr.push(i);
    }
    return arr;
};

const hoverActive = (index: any) => {
    return (
        (index > firstActiveIndex.value &&
            index < hoverItem.value &&
            hoverItem.value !== INIT_DATA) ||
        (index < firstActiveIndex.value &&
            index > hoverItem.value &&
            hoverItem.value !== INIT_DATA) ||
        (index > firstActiveIndex.value && index < secondActiveIndex.value)
    );
};

const mouseover = (index: any) => {
    if (firstActiveIndex.value >= ZERO && secondActiveIndex.value >= ZERO) {
        return;
    }
    if (firstActiveIndex.value >= ZERO) {
        hoverItem.value = index;
    }
};

const selectLi = (index: any) => {
    if (firstActiveIndex.value >= ZERO && secondActiveIndex.value >= ZERO) {
        firstActiveIndex.value = index;
        secondActiveIndex.value = INIT_DATA;
        hoverItem.value = INIT_DATA;
    } else if (firstActiveIndex.value >= ZERO) {
        if (props?.notAllowSameDay && firstActiveIndex.value === index) return; //禁止选同一天

        secondActiveIndex.value = index;
        if (firstActiveIndex.value > secondActiveIndex.value) {
            let others;
            others = secondActiveIndex.value;
            secondActiveIndex.value = firstActiveIndex.value;
            firstActiveIndex.value = others;
        }
        inputVal.value = {
            start: firstActiveIndex.value + DIFF_DATA + "号",
            end: secondActiveIndex.value + DIFF_DATA + "号",
        };
        if (props?.format === 'array') {
            emit("update:modelValue", format2Array(firstActiveIndex.value + DIFF_DATA, secondActiveIndex.value + DIFF_DATA))
        }
        else {
            emit("update:modelValue", {
                start: firstActiveIndex.value + DIFF_DATA,
                end: secondActiveIndex.value + DIFF_DATA,
            });
        }

        isShow.value = false;
    } else {
        firstActiveIndex.value = index;
    }
};

const format2Array = (start: number, end: number) => {
    const arr = <any>[];
    for (let i: number = start; i <= end; i++) {
        arr.push(i);
    }
    return arr
}

const del = () => {
    if (props.disabled) return;
    inputVal.value = {
        start: "",
        end: "",
    };
    emit("update:modelValue", []);
    firstActiveIndex.value = INIT_DATA;
    secondActiveIndex.value = INIT_DATA;
    hoverItem.value = INIT_DATA;
};

const close = (e: any) => {
    if (
        e.target !== document.getElementById("vue-day-picker-select-wrapper") &&
        e.target !== document.getElementById("vue-day-picker-input_start") &&
        e.target !== document.getElementById("vue-day-picker-input_end") &&
        ![
            ...document.getElementsByClassName("vue-day-picker-select_item"),
        ].includes(e.target)
    ) {
        isShow.value = false;
    }
};

onMounted(() => {
    document.addEventListener(
        "click",
        close,
        true //处于捕获阶段执行
    );
});
onUnmounted(() => {
    document.removeEventListener("click", close, true);
});
</script>

<style lang="scss" scoped>
.vue-day-picker-wrapper {
    .vue-day-picker-input-wrapper {
        width: 100%;
        height: 36px;
        display: inline-flex;
        align-items: center;
        padding: 0 12px;
        line-height: 34px;
        text-align: left;
        background-color: #fff;
        background-image: none;
        border-radius: 4px;
        border: 1px solid #d5d6d9;
        box-sizing: border-box;

        &.vue-day-picker-input-wrapper_disabled {
            background: #f0f2f5;
            border: 1px solid #d5d6d9;
            color: #bbbdbf;

            &:hover {
                border: 1px solid #d5d6d9;
            }

            span {
                cursor: not-allowed;
            }

            input {
                background: #f0f2f5;
                color: #bbbdbf;
                cursor: not-allowed;

                &::placeholder {
                    color: #bbbdbf;
                }
            }

            .vue-day-picker-icon_timer {
                cursor: not-allowed;
            }



        }

        input {
            flex: auto;
            appearance: none;
            border: none;
            outline: none;
            height: 100%;
            margin: 0;
            padding: 0;
            width: 20%;
            font-size: 14px;
            color: #606266;
        }

        span {
            width: 20px;
        }



        .vue-day-picker-icon_close,
        .vue-day-picker-icon_timer {
            width: 16px;
            height: 16px;
            text-align: center;
            line-height: 16px;
            cursor: pointer;
        }


        &:hover {
            border-color: #327dff;
        }

        &.vue-day-picker-input-wrapper_active {
            border-color: #327dff;
        }
    }

    .vue-day-picker-select-wrapper {
        width: 300px;
        z-index: 1000;
        position: absolute;
        top: 43px;
        height: 184px;
        background: #fff;
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        padding: 5px 5px;
        box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.05),
            0 2px 4px 1px rgba(0, 0, 0, 0.02), 0 -2px 4px 0 rgba(0, 0, 0, 0.02),
            0 2px 6px 0 rgba(0, 0, 0, 0.04);
        box-sizing: border-box;

        .vue-day-picker-select_item {
            width: 24px;
            height: 24px;
            list-style: none;
            margin: 4px 7px;
            line-height: 24px;
            text-align: center;
            border: 1px solid transparent;
            border-radius: 4px;
            color: #575859;
            cursor: pointer;

            &:hover {
                border: 1px solid #327dff;
                color: #327dff;
            }

            &.active {
                color: #fff;
                background-color: #327dff;
                border: 1px solid #327dff;
            }

            &.hoverActive {
                background-color: rgba(50, 125, 255, 0.08);
            }
        }
    }
}
</style>
