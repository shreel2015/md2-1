import { ApplicationRef, ComponentRef, Directive, DynamicComponentLoader, HostListener, Input, Provider, ReflectiveInjector, ViewContainerRef } from '@angular/core';
import { ViewContainerRef_ } from '@angular/core/src/linker/view_container_ref';
import { Md2TooltipComponent } from './tooltip.component';
import { Md2TooltipOptions } from './tooltip.options';

@Directive({
  selector: '[tooltip]'
})

export class Md2Tooltip {
  private visible: boolean = false;
  private timer: any;

  @Input('tooltip') content: string;
  @Input('tooltip-direction') direction: string = 'bottom';
  @Input('tooltip-delay') delay: number = 0;

  private viewContainerRef: ViewContainerRef;
  private loader: DynamicComponentLoader;

  private tooltip: Promise<ComponentRef<any>>;

  constructor(viewContainerRef: ViewContainerRef, loader: DynamicComponentLoader, private appRef: ApplicationRef) {
    this.viewContainerRef = viewContainerRef;
    this.loader = loader;
  }

  @HostListener('focusin', ['$event'])
  @HostListener('mouseenter', ['$event'])
  public show(event: Event): void {
    if (this.visible) {
      return;
    }
    this.visible = true;
    let options = new Md2TooltipOptions({
      content: this.content,
      direction: this.direction,
      hostEl: this.viewContainerRef.element
    });

    let binding = ReflectiveInjector.resolve([
      new Provider(Md2TooltipOptions, { useValue: options })
    ]);
    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      this.timer = 0;
      let appElement: ViewContainerRef = new ViewContainerRef_(this.appRef['_rootComponents'][0]._hostElement);
      this.tooltip = this.loader
        .loadNextToLocation(Md2TooltipComponent, appElement, binding)
        .then((componentRef: ComponentRef<any>) => {
          return componentRef;
        });
    }, this.delay);
  }

  @HostListener('focusout', ['$event'])
  @HostListener('mouseleave', ['$event'])
  public hide(event: Event): void {
    clearTimeout(this.timer);
    if (!this.visible) {
      return;
    }
    this.visible = false;
    if (this.tooltip) {
      this.tooltip.then((componentRef: ComponentRef<any>) => {
        componentRef.destroy();
        return componentRef;
      });
    }
  }
}

export const TOOLTIP_DIRECTIVES: Array<any> = [Md2Tooltip, Md2TooltipComponent];
