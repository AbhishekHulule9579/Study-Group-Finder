import { CssDimValue } from '@fullcalendar/core';
import { BaseComponent, ViewContext, PositionCache, ScrollRequest } from '@fullcalendar/core/internal';
import { createElement, Ref } from '@fullcalendar/core/preact';
import { TimelineCoords, TimelineDateProfile, TimelineLaneCoreProps } from '@fullcalendar/timeline/internal';
import { ResourceViewProps, ResourceNode, GroupNode, ColSpec, Resource } from '@fullcalendar/resource/internal';

interface ResourceTimelineViewState {
    resourceAreaWidth: CssDimValue;
    spreadsheetColWidths: number[];
    slatCoords?: TimelineCoords;
    slotCushionMaxWidth?: number;
}
interface ResourceTimelineViewSnapshot {
    resourceScroll?: ResourceScrollState;
}
interface ResourceScrollState {
    rowId: string;
    fromBottom: number;
}
declare class ResourceTimelineView extends BaseComponent<ResourceViewProps, ResourceTimelineViewState> {
    private processColOptions;
    private buildTimelineDateProfile;
    private hasNesting;
    private buildRowNodes;
    private layoutRef;
    private rowNodes;
    private renderedRowNodes;
    private buildRowIndex;
    private rowCoords;
    private scrollResponder;
    constructor(props: ResourceViewProps, context: ViewContext);
    render(): createElement.JSX.Element;
    renderSpreadsheetRows(nodes: (ResourceNode | GroupNode)[], colSpecs: ColSpec[], rowSyncHeights: number[]): createElement.JSX.Element[];
    componentDidMount(): void;
    getSnapshotBeforeUpdate(): ResourceTimelineViewSnapshot;
    componentDidUpdate(prevProps: ResourceViewProps, prevState: ResourceTimelineViewState, snapshot: ResourceTimelineViewSnapshot): void;
    componentWillUnmount(): void;
    handleSlatCoords: (slatCoords: TimelineCoords) => void;
    handleRowCoords: (rowCoords: PositionCache) => void;
    handleMaxCushionWidth: (slotCushionMaxWidth: any) => void;
    computeFallbackSlotMinWidth(tDateProfile: TimelineDateProfile): number;
    handleScrollLeftRequest: (scrollLeft: number) => void;
    handleScrollRequest: (request: ScrollRequest & ResourceScrollState) => boolean;
    queryResourceScroll(): ResourceScrollState;
    handleColWidthChange: (colWidths: number[]) => void;
}

interface ResourceTimelineLaneProps extends TimelineLaneCoreProps {
    elRef: Ref<HTMLTableRowElement>;
    resource: Resource;
    innerHeight: CssDimValue;
    onHeightChange?: (rowEl: HTMLTableRowElement, isStable: boolean) => void;
}
declare class ResourceTimelineLane extends BaseComponent<ResourceTimelineLaneProps> {
    private refineRenderProps;
    render(): createElement.JSX.Element;
    handleHeightChange: (innerEl: HTMLElement, isStable: boolean) => void;
}

interface SpreadsheetRowProps {
    colSpecs: ColSpec[];
    rowSpans: number[];
    depth: number;
    isExpanded: boolean;
    hasChildren: boolean;
    resource: Resource;
    innerHeight: CssDimValue;
}
declare class SpreadsheetRow extends BaseComponent<SpreadsheetRowProps, ViewContext> {
    render(): createElement.JSX.Element;
}

export { ResourceTimelineLane, ResourceTimelineView, SpreadsheetRow };
