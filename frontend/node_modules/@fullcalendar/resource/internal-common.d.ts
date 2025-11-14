import { RawOptionsFromRefiners, EventStore, EventUi, Identity, Dictionary, parseClassNames, CalendarContext, Action, DateRange, ElProps, InnerContainerFunc, MountArg, BaseComponent, CustomContentGenerator, DidMountHandler, WillUnmountHandler, OrderSpec, DateMarker, DateFormatter, DateProfile, DayTableModel, DayTableCell, Seg, SlicedProps, EventSegUiInteractionState, Splitter, DateSpan, EventDef, SplittableProps, ViewProps } from '@fullcalendar/core/internal';
import { BusinessHoursInput, ConstraintInput, AllowFunc, EventApi, ViewApi, ClassNamesGenerator } from '@fullcalendar/core';
import { createElement, ComponentChild, VNode } from '@fullcalendar/core/preact';

declare const RESOURCE_REFINERS: {
    id: StringConstructor;
    parentId: StringConstructor;
    children: Identity<ResourceInput[]>;
    title: StringConstructor;
    businessHours: Identity<BusinessHoursInput>;
    extendedProps: Identity<Dictionary>;
    eventEditable: BooleanConstructor;
    eventStartEditable: BooleanConstructor;
    eventDurationEditable: BooleanConstructor;
    eventConstraint: Identity<ConstraintInput>;
    eventOverlap: BooleanConstructor;
    eventAllow: Identity<AllowFunc>;
    eventClassNames: typeof parseClassNames;
    eventBackgroundColor: StringConstructor;
    eventBorderColor: StringConstructor;
    eventTextColor: StringConstructor;
    eventColor: StringConstructor;
};
type BuiltInResourceRefiners = typeof RESOURCE_REFINERS;
interface ResourceRefiners extends BuiltInResourceRefiners {
}
type ResourceInput = RawOptionsFromRefiners<Required<ResourceRefiners>> & // Required hack
{
    [extendedProps: string]: any;
};
interface Resource {
    id: string;
    parentId: string;
    title: string;
    businessHours: EventStore | null;
    ui: EventUi;
    extendedProps: {
        [extendedProp: string]: any;
    };
}
type ResourceHash = {
    [resourceId: string]: Resource;
};
declare function getPublicId(id: string): string;

declare class ResourceApi {
    private _context;
    _resource: Resource;
    constructor(_context: CalendarContext, _resource: Resource);
    setProp(name: string, value: any): void;
    setExtendedProp(name: string, value: any): void;
    private sync;
    remove(): void;
    getParent(): ResourceApi | null;
    getChildren(): ResourceApi[];
    getEvents(): EventApi[];
    get id(): string;
    get title(): string;
    get eventConstraint(): any;
    get eventOverlap(): boolean;
    get eventAllow(): any;
    get eventBackgroundColor(): string;
    get eventBorderColor(): string;
    get eventTextColor(): string;
    get eventClassNames(): string[];
    get extendedProps(): {
        [extendedProp: string]: any;
    };
    toPlainObject(settings?: {
        collapseExtendedProps?: boolean;
        collapseEventColor?: boolean;
    }): Dictionary;
    toJSON(): Dictionary;
}

type ResourceAction = Action | {
    type: 'FETCH_RESOURCE';
} | {
    type: 'RECEIVE_RESOURCES';
    rawResources: ResourceInput[];
    fetchId: string;
    fetchRange: DateRange | null;
} | {
    type: 'RECEIVE_RESOURCE_ERROR';
    error: Error;
    fetchId: string;
    fetchRange: DateRange | null;
} | {
    type: 'ADD_RESOURCE';
    resourceHash: ResourceHash;
} | // use a hash because needs to accept children
{
    type: 'REMOVE_RESOURCE';
    resourceId: string;
} | {
    type: 'SET_RESOURCE_PROP';
    resourceId: string;
    propName: string;
    propValue: any;
} | {
    type: 'SET_RESOURCE_EXTENDED_PROP';
    resourceId: string;
    propName: string;
    propValue: any;
} | {
    type: 'SET_RESOURCE_ENTITY_EXPANDED';
    id: string;
    isExpanded: boolean;
} | {
    type: 'RESET_RESOURCE_SOURCE';
    resourceSourceInput: any;
} | {
    type: 'REFETCH_RESOURCES';
};

type ResourceEntityExpansions = {
    [id: string]: boolean;
};

interface ResourceLabelContainerProps extends ElProps {
    resource: Resource;
    date?: Date;
    children?: InnerContainerFunc<ResourceLabelContentArg>;
}
interface ResourceLabelContentArg {
    resource: ResourceApi;
    date?: Date;
    view: ViewApi;
}
type ResourceLabelMountArg = MountArg<ResourceLabelContentArg>;
declare class ResourceLabelContainer extends BaseComponent<ResourceLabelContainerProps> {
    private refineRenderProps;
    render(): createElement.JSX.Element;
}

interface ColHeaderContentArg {
    view: ViewApi;
}
type ColHeaderMountArg = MountArg<ColHeaderContentArg>;
interface ColCellContentArg {
    resource?: ResourceApi;
    groupValue?: any;
    view: ViewApi;
}
type ColCellMountArg = MountArg<ColCellContentArg>;
interface ColHeaderRenderHooks {
    headerClassNames?: ClassNamesGenerator<ColHeaderContentArg>;
    headerContent?: CustomContentGenerator<ColHeaderContentArg>;
    headerDefault?: (renderProps: ColHeaderContentArg) => ComponentChild;
    headerDidMount?: DidMountHandler<ColHeaderMountArg>;
    headerWillUnmount?: WillUnmountHandler<ColHeaderMountArg>;
}
interface ColSpec extends ColHeaderRenderHooks {
    group?: boolean;
    isMain?: boolean;
    width?: number;
    field?: string;
    cellClassNames?: ClassNamesGenerator<ColCellContentArg>;
    cellContent?: CustomContentGenerator<ColCellContentArg>;
    cellDidMount?: DidMountHandler<ColCellMountArg>;
    cellWillUnmount?: WillUnmountHandler<ColCellMountArg>;
}
interface GroupLaneRenderHooks {
    laneClassNames?: ClassNamesGenerator<ColCellContentArg>;
    laneContent?: CustomContentGenerator<ColCellContentArg>;
    laneDidMount?: DidMountHandler<ColCellMountArg>;
    laneWillUnmount?: WillUnmountHandler<ColCellMountArg>;
}
interface GroupSpec extends GroupLaneRenderHooks {
    field?: string;
    order?: number;
    labelClassNames?: ClassNamesGenerator<ColCellContentArg>;
    labelContent?: CustomContentGenerator<ColCellContentArg>;
    labelDidMount?: DidMountHandler<ColCellMountArg>;
    labelWillUnmount?: WillUnmountHandler<ColCellMountArg>;
}

interface ResourceLaneContentArgInput {
    resource: Resource;
    context: CalendarContext;
}
interface ResourceLaneContentArg {
    resource: ResourceApi;
}
type ResourceLaneMountArg = MountArg<ResourceLaneContentArg>;
declare function refineRenderProps(input: ResourceLaneContentArgInput): ResourceLaneContentArg;

declare const DEFAULT_RESOURCE_ORDER: OrderSpec<unknown>[];
interface ResourceAddArg {
    resource: ResourceApi;
    revert: () => void;
}
interface ResourceChangeArg {
    oldResource: ResourceApi;
    resource: ResourceApi;
    revert: () => void;
}
interface ResourceRemoveArg {
    resource: ResourceApi;
    revert: () => void;
}

interface ResourceDayHeaderProps {
    dates: DateMarker[];
    dateProfile: DateProfile;
    datesRepDistinctDays: boolean;
    resources: Resource[];
    renderIntro?: (rowKey: string) => VNode;
}
declare class ResourceDayHeader extends BaseComponent<ResourceDayHeaderProps> {
    private buildDateFormat;
    render(): createElement.JSX.Element;
    renderResourceRow(resources: Resource[], date: DateMarker): createElement.JSX.Element;
    renderDayAndResourceRows(dates: DateMarker[], dateFormat: DateFormatter, todayRange: DateRange, resources: Resource[]): createElement.JSX.Element;
    renderResourceAndDayRows(resources: Resource[], dates: DateMarker[], dateFormat: DateFormatter, todayRange: DateRange): createElement.JSX.Element;
    renderDateCell(date: DateMarker, dateFormat: DateFormatter, todayRange: DateRange, colSpan: number, resource?: Resource, isSticky?: boolean): createElement.JSX.Element;
    buildTr(cells: VNode[], key: string): createElement.JSX.Element;
}

declare class ResourceIndex {
    indicesById: {
        [resourceId: string]: number;
    };
    ids: string[];
    length: number;
    constructor(resources: Resource[]);
}

declare abstract class AbstractResourceDayTableModel {
    dayTableModel: DayTableModel;
    resources: Resource[];
    private context;
    cells: DayTableCell[][];
    rowCnt: number;
    colCnt: number;
    resourceIndex: ResourceIndex;
    constructor(dayTableModel: DayTableModel, resources: Resource[], context: CalendarContext);
    abstract computeCol(dateI: any, resourceI: any): number;
    abstract computeColRanges(dateStartI: any, dateEndI: any, resourceI: any): {
        firstCol: number;
        lastCol: number;
        isStart: boolean;
        isEnd: boolean;
    }[];
    buildCells(): DayTableCell[][];
}

declare class ResourceDayTableModel extends AbstractResourceDayTableModel {
    computeCol(dateI: any, resourceI: any): any;
    computeColRanges(dateStartI: any, dateEndI: any, resourceI: any): {
        firstCol: any;
        lastCol: any;
        isStart: boolean;
        isEnd: boolean;
    }[];
}

declare class DayResourceTableModel extends AbstractResourceDayTableModel {
    computeCol(dateI: any, resourceI: any): any;
    computeColRanges(dateStartI: any, dateEndI: any, resourceI: any): any[];
}

declare abstract class VResourceJoiner<SegType extends Seg> {
    private joinDateSelection;
    private joinBusinessHours;
    private joinFgEvents;
    private joinBgEvents;
    private joinEventDrags;
    private joinEventResizes;
    joinProps(propSets: {
        [resourceId: string]: SlicedProps<SegType>;
    }, resourceDayTable: AbstractResourceDayTableModel): SlicedProps<SegType>;
    joinSegs(resourceDayTable: AbstractResourceDayTableModel, ...segGroups: SegType[][]): SegType[];
    expandSegs(resourceDayTable: AbstractResourceDayTableModel, segs: SegType[]): any[];
    joinInteractions(resourceDayTable: AbstractResourceDayTableModel, ...interactions: EventSegUiInteractionState[]): EventSegUiInteractionState | null;
    abstract transformSeg(seg: SegType, resourceDayTable: AbstractResourceDayTableModel, resourceI: number): SegType[];
}

interface VResourceProps extends SplittableProps {
    resourceDayTableModel: AbstractResourceDayTableModel;
}
declare class VResourceSplitter extends Splitter<VResourceProps> {
    getKeyInfo(props: VResourceProps): any;
    getKeysForDateSpan(dateSpan: DateSpan): string[];
    getKeysForEventDef(eventDef: EventDef): string[];
}

interface ResourceViewProps extends ViewProps {
    resourceStore: ResourceHash;
    resourceEntityExpansions: ResourceEntityExpansions;
}

interface Group {
    value: any;
    spec: GroupSpec;
}
interface GroupNode {
    id: string;
    isExpanded: boolean;
    group: Group;
}
interface ResourceNode {
    id: string;
    rowSpans: number[];
    depth: number;
    isExpanded: boolean;
    hasChildren: boolean;
    resource: Resource;
    resourceFields: any;
}
declare function flattenResources(resourceStore: ResourceHash, orderSpecs: OrderSpec<ResourceApi>[]): Resource[];
declare function buildRowNodes(resourceStore: ResourceHash, groupSpecs: GroupSpec[], orderSpecs: OrderSpec<ResourceApi>[], isVGrouping: boolean, expansions: ResourceEntityExpansions, expansionDefault: boolean): (GroupNode | ResourceNode)[];
declare function buildResourceFields(resource: Resource): any;
declare function isGroupsEqual(group0: Group, group1: Group): boolean;

interface SplittableResourceProps extends SplittableProps {
    resourceStore: ResourceHash;
}
declare class ResourceSplitter extends Splitter<SplittableResourceProps> {
    getKeyInfo(props: SplittableResourceProps): {
        '': {};
    };
    getKeysForDateSpan(dateSpan: DateSpan): string[];
    getKeysForEventDef(eventDef: EventDef): string[];
}

export { AbstractResourceDayTableModel as A, Group as B, ColSpec as C, DEFAULT_RESOURCE_ORDER as D, isGroupsEqual as E, GroupNode as F, GroupLaneRenderHooks as G, ResourceNode as H, buildRowNodes as I, buildResourceFields as J, GroupSpec as K, ResourceSplitter as L, ResourceLabelContainer as M, ResourceLabelContainerProps as N, ResourceInput as R, VResourceJoiner as V, ColHeaderContentArg as a, ColHeaderMountArg as b, ColCellContentArg as c, ColCellMountArg as d, ResourceLabelContentArg as e, ResourceLabelMountArg as f, ResourceLaneContentArg as g, ResourceLaneMountArg as h, ResourceApi as i, ResourceAddArg as j, ResourceChangeArg as k, ResourceRemoveArg as l, ResourceAction as m, ResourceHash as n, ResourceEntityExpansions as o, ResourceLaneContentArgInput as p, ColHeaderRenderHooks as q, refineRenderProps as r, ResourceDayHeader as s, ResourceDayTableModel as t, DayResourceTableModel as u, VResourceSplitter as v, Resource as w, getPublicId as x, ResourceViewProps as y, flattenResources as z };
