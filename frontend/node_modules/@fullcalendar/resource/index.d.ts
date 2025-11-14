import { CssDimValue, ClassNamesGenerator, PluginDef } from '@fullcalendar/core';
import { R as ResourceInput, C as ColSpec, a as ColHeaderContentArg, b as ColHeaderMountArg, c as ColCellContentArg, d as ColCellMountArg, e as ResourceLabelContentArg, f as ResourceLabelMountArg, g as ResourceLaneContentArg, h as ResourceLaneMountArg, i as ResourceApi, j as ResourceAddArg, k as ResourceChangeArg, l as ResourceRemoveArg, m as ResourceAction, n as ResourceHash, o as ResourceEntityExpansions } from './internal-common.js';
export { c as ColCellContentArg, d as ColCellMountArg, a as ColHeaderContentArg, b as ColHeaderMountArg, q as ColHeaderRenderHooks, C as ColSpec, G as GroupLaneRenderHooks, j as ResourceAddArg, i as ResourceApi, k as ResourceChangeArg, R as ResourceInput, e as ResourceLabelContentArg, f as ResourceLabelMountArg, g as ResourceLaneContentArg, p as ResourceLaneContentArgInput, h as ResourceLaneMountArg, l as ResourceRemoveArg } from './internal-common.js';
import { DateRange, RawOptionsFromRefiners, Identity, Dictionary, parseFieldSpecs, CustomContentGenerator, DidMountHandler, WillUnmountHandler } from '@fullcalendar/core/internal';
import '@fullcalendar/premium-common';
import '@fullcalendar/core/preact';

interface ResourceSource<ResourceSourceMeta> {
    _raw: any;
    sourceId: string;
    sourceDefId: number;
    meta: ResourceSourceMeta;
    publicId: string;
    isFetching: boolean;
    latestFetchId: string;
    fetchRange: DateRange | null;
}

interface ResourceFuncArg {
    start?: Date;
    end?: Date;
    startStr?: string;
    endStr?: string;
    timeZone?: string;
}
type ResourceFunc = ((arg: ResourceFuncArg, successCallback: (resourceInputs: ResourceInput[]) => void, failureCallback: (error: Error) => void) => void) | ((arg: ResourceFuncArg) => Promise<ResourceInput[]>);

declare const RESOURCE_SOURCE_REFINERS: {
    id: StringConstructor;
    resources: Identity<ResourceFunc | ResourceInput[]>;
    url: StringConstructor;
    method: StringConstructor;
    startParam: StringConstructor;
    endParam: StringConstructor;
    timeZoneParam: StringConstructor;
    extraParams: Identity<Dictionary | (() => Dictionary)>;
};
type ResourceSourceInputObject = RawOptionsFromRefiners<typeof RESOURCE_SOURCE_REFINERS>;
type ResourceSourceInput = ResourceSourceInputObject | ResourceInput[] | ResourceFunc | string;

declare const OPTION_REFINERS: {
    initialResources: Identity<ResourceSourceInput>;
    resources: Identity<ResourceSourceInput>;
    eventResourceEditable: BooleanConstructor;
    refetchResourcesOnNavigate: BooleanConstructor;
    resourceOrder: typeof parseFieldSpecs;
    filterResourcesWithEvents: BooleanConstructor;
    resourceGroupField: StringConstructor;
    resourceAreaWidth: Identity<CssDimValue>;
    resourceAreaColumns: Identity<ColSpec[]>;
    resourcesInitiallyExpanded: BooleanConstructor;
    datesAboveResources: BooleanConstructor;
    needsResourceData: BooleanConstructor;
    resourceAreaHeaderClassNames: Identity<ClassNamesGenerator<ColHeaderContentArg>>;
    resourceAreaHeaderContent: Identity<CustomContentGenerator<ColHeaderContentArg>>;
    resourceAreaHeaderDidMount: Identity<DidMountHandler<ColHeaderMountArg>>;
    resourceAreaHeaderWillUnmount: Identity<WillUnmountHandler<ColHeaderMountArg>>;
    resourceGroupLabelClassNames: Identity<ClassNamesGenerator<ColCellContentArg>>;
    resourceGroupLabelContent: Identity<CustomContentGenerator<ColCellContentArg>>;
    resourceGroupLabelDidMount: Identity<DidMountHandler<ColCellMountArg>>;
    resourceGroupLabelWillUnmount: Identity<WillUnmountHandler<ColCellMountArg>>;
    resourceLabelClassNames: Identity<ClassNamesGenerator<ResourceLabelContentArg>>;
    resourceLabelContent: Identity<CustomContentGenerator<ResourceLabelContentArg>>;
    resourceLabelDidMount: Identity<DidMountHandler<ResourceLabelMountArg>>;
    resourceLabelWillUnmount: Identity<WillUnmountHandler<ResourceLabelMountArg>>;
    resourceLaneClassNames: Identity<ClassNamesGenerator<ResourceLaneContentArg>>;
    resourceLaneContent: Identity<CustomContentGenerator<ResourceLaneContentArg>>;
    resourceLaneDidMount: Identity<DidMountHandler<ResourceLaneMountArg>>;
    resourceLaneWillUnmount: Identity<WillUnmountHandler<ResourceLaneMountArg>>;
    resourceGroupLaneClassNames: Identity<ClassNamesGenerator<ColCellContentArg>>;
    resourceGroupLaneContent: Identity<CustomContentGenerator<ColCellContentArg>>;
    resourceGroupLaneDidMount: Identity<DidMountHandler<ColCellMountArg>>;
    resourceGroupLaneWillUnmount: Identity<WillUnmountHandler<ColCellMountArg>>;
};
declare const LISTENER_REFINERS: {
    resourcesSet: Identity<(resources: ResourceApi[]) => void>;
    resourceAdd: Identity<(arg: ResourceAddArg) => void>;
    resourceChange: Identity<(arg: ResourceChangeArg) => void>;
    resourceRemove: Identity<(arg: ResourceRemoveArg) => void>;
};

declare const EVENT_REFINERS: {
    resourceId: StringConstructor;
    resourceIds: Identity<string[]>;
    resourceEditable: BooleanConstructor;
};

type ExtraOptionRefiners = typeof OPTION_REFINERS;
type ExtraListenerRefiners = typeof LISTENER_REFINERS;
type ExtraEventRefiners = typeof EVENT_REFINERS;
declare module '@fullcalendar/core' {
    interface DatePointApi {
        resource?: ResourceApi;
    }
    interface DateSpanApi {
        resource?: ResourceApi;
    }
    interface EventDropArg {
        oldResource?: ResourceApi;
        newResource?: ResourceApi;
    }
}
declare module '@fullcalendar/core/internal' {
    interface BaseOptionRefiners extends ExtraOptionRefiners {
    }
    interface CalendarListenerRefiners extends ExtraListenerRefiners {
    }
    interface EventRefiners extends ExtraEventRefiners {
    }
    interface CalendarContext {
        dispatch(action: ResourceAction): void;
    }
    interface CalendarData {
        resourceSource?: ResourceSource<any>;
        resourceStore?: ResourceHash;
        resourceEntityExpansions?: ResourceEntityExpansions;
    }
    interface EventMutation {
        resourceMutation?: {
            matchResourceId: string;
            setResourceId: string;
        };
    }
    interface EventDef {
        resourceIds?: string[];
        resourceEditable?: boolean;
    }
}
//# sourceMappingURL=ambient.d.ts.map

declare module '@fullcalendar/core' {
    interface EventApi {
        getResources: () => ResourceApi[];
        setResources: (resources: (string | ResourceApi)[]) => void;
    }
}
declare module '@fullcalendar/core/internal' {
    interface EventImpl {
        getResources: () => ResourceApi[];
        setResources: (resources: (string | ResourceApi)[]) => void;
    }
}
//# sourceMappingURL=EventApi.d.ts.map

declare module '@fullcalendar/core' {
    interface CalendarApi {
        addResource(input: ResourceInput, scrollTo?: boolean): ResourceApi;
        getResourceById(id: string): ResourceApi | null;
        getResources(): ResourceApi[];
        getTopLevelResources(): ResourceApi[];
        refetchResources(): void;
    }
}
declare module '@fullcalendar/core/internal' {
    interface CalendarImpl {
        dispatch(action: ResourceAction): any;
        addResource(input: ResourceInput, scrollTo?: boolean): ResourceApi;
        getResourceById(id: string): ResourceApi | null;
        getResources(): ResourceApi[];
        getTopLevelResources(): ResourceApi[];
        refetchResources(): void;
    }
}

declare const _default: PluginDef;
//# sourceMappingURL=index.d.ts.map

export { ResourceFunc, ResourceFuncArg, ResourceSourceInput, ResourceSourceInputObject, _default as default };
