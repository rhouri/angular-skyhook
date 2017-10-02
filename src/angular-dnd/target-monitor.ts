import { DragDropManager } from './manager';
import { invariant } from './invariant';
import { MonitorBase, InternalMonitor } from './internal-monitor';

let isCallingCanDrop = false;

export interface DropTargetMonitor extends MonitorBase {
    /**
     * Returns `true` if there is a drag operation in progress, and the owner's
     * `canDrop()` returns true or is not defined.
     */
    canDrop(): boolean;

    /**
     * Returns `true` if there is a drag operation in progress, and the pointer
     * is currently hovering over the owner. You may optionally pass
     * `{ shallow: true }` to strictly check whether only the owner is being
     * hovered, as opposed to a nested target.
     */
    isOver(options?: {shallow: boolean}): boolean;

    /**
     * Returns a plain object representing the last recorded drop result. The
     * drop targets may optionally specify it by returning an object from their
     * `drop()` methods. When a chain of `drop()` is dispatched for the nested
     * targets, bottom up, any parent that explicitly returns its own result
     * from `drop()` overrides the drop result previously set by the child.
     * Returns `null` if called outside `drop()`.
     * */
    getDropResult(): {} & any;
}

class DropTargetMonitorClass implements DropTargetMonitor {
    internalMonitor: InternalMonitor;
    targetId: any;

    constructor(manager: DragDropManager) {
        this.internalMonitor = manager.getMonitor();
    }

    receiveHandlerId(targetId) {
        this.targetId = targetId;
    }

    canDrop(): boolean {
        invariant(
            !isCallingCanDrop,
            'You may not call monitor.canDrop() inside your canDrop() implementation. ' +
            'Read more: http://react-dnd.github.io/react-dnd/docs-drop-target-monitor.html',
        );

        try {
            isCallingCanDrop = true;
            return this.internalMonitor.canDropOnTarget(this.targetId);
        } finally {
            isCallingCanDrop = false;
        }
    }

    isOver(options = {shallow: true}): boolean {
        return this.internalMonitor.isOverTarget(this.targetId, options);
    }

    getItemType() {
        return this.internalMonitor.getItemType();
    }

    getItem(): {} & any {
        return this.internalMonitor.getItem();
    }

    getDropResult() {
        return this.internalMonitor.getDropResult();
    }

    didDrop(): boolean {
        return this.internalMonitor.didDrop();
    }

    getInitialClientOffset() {
        return this.internalMonitor.getInitialClientOffset();
    }

    getInitialSourceClientOffset() {
        return this.internalMonitor.getInitialSourceClientOffset();
    }

    getSourceClientOffset() {
        return this.internalMonitor.getSourceClientOffset();
    }

    getClientOffset() {
        return this.internalMonitor.getClientOffset();
    }

    getDifferenceFromInitialOffset() {
        return this.internalMonitor.getDifferenceFromInitialOffset();
    }
}

export function createTargetMonitor(manager: DragDropManager): DropTargetMonitor {
    return new DropTargetMonitorClass(manager);
}
