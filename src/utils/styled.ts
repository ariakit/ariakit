import sc from 'styled-components';
import scts from 'styled-components-ts';
import { ComponentType } from 'react';
import { ReakitComponent } from '../enhancers/as';

/**
 * This is a version of the main `styled` function of styled components that allows typechecking
 * the props that the styled component uses.
 * 
 * @param target A component to wrap
 * 
 * @example ```ts
 * type ArrowProps = {
 *   angle?: number
 * }
 * 
 * styled<ArrowProps>(Base)`
 *    transform: rotate(${props => props.angle})
 * `
 * 
 * 
 * const MyComponent = () => (
 *  <Arrow angle="foo" />  // Error
 * )
 * ```
 */
export default function styled<Props>(target: ComponentType<any> | ReakitComponent<any>){
  return scts<Props>(sc(target));
}