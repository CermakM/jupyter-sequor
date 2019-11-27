/**
 * Jupyter Sequor.
 *
 * @link   https://github.com/CermakM/jupyter-sequor#readme
 * @file   This file implements the Jupyter extension for following cell outputs.
 * @author Marek Cermak <macermak@redhat.com>
 * @since  0.0.0
 */

import config from "./config"

import style from "../assets/style.scss"

// Jupyter runtime environment
const events = require( "base/js/events" )
const OutputArea = require( "notebook/js/outputarea" ).OutputArea


OutputArea.prototype.enable_follow = function () {
  this.follow_output = true

  const btn = this.element.find( "[data-action='no-follow']" )
  if ( btn.length <= 0 ) {
    return // already enabled
  }

  btn.attr( "data-action", "follow" )
}

OutputArea.prototype.disable_follow = function () {
  this.follow_output = false

  const btn = this.element.find( "[data-action='follow']" )
  if ( btn.length <= 0 ) {
    return // already disabled
  }

  btn.attr( "data-action", "no-follow" )
}

OutputArea.prototype.toggle_follow = function () {
  this.follow_output = !this.follow_output

  if ( !this.scrolled ) return   // sanity check

  const btn = this.element.find( "[data-action*='follow']" )
  if ( btn.length <= 0 ) {
    throw Error( "Follow button does not exist in the output area." )
  }

  if ( this.follow_output ) {
    btn.attr( "data-action", "follow" )
    this.scroll_to_bottom()
  } else btn.attr( "data-action", "no-follow" )
}

OutputArea.prototype.scroll_to_bottom = function () {
  if ( !this.follow_output ) return

  const elt = this.element.get( 0 )
  if ( _.isUndefined( elt ) ) {
    return
  }

  elt.scrollBy( {
    top: elt.scrollHeight - elt.scrollTop,
    left: 0,
    behavior: "smooth"
  } )
}

OutputArea.prototype.follow_area = function () {
  const btn = $( "<div/>" )
    .addClass( "notification_widget btn btn-xs" )
    .attr( "data-action", this.follow_output ? "follow" : "no-follow" )
    .append( "<span>Follow</span>" )
    .on( "click", this.toggle_follow.bind( this ) )

  this.element.append( btn )

  this.element.on( "scroll", () => {

    // detect the direction and toggle follow accordingly
    const pos = this.element.scrollTop()
    if ( pos < this.last_scroll_position ) {
      this.disable_follow()
    }
    this.last_scroll_position = pos
  } )
}

const scroll_area = OutputArea.prototype.scroll_area
OutputArea.prototype.scroll_area = function () {
  scroll_area.call( this )

  this.follow_output = _.isUndefined( this.follow_output )
    ? _.get( Jupyter.notebook.metadata, "follow_output", true )
    : this.follow_output

  this.last_scroll_position = this.element.scrollTop()

  if ( this.element.find( "[data-action*='follow']" ).length <= 0 ) {
    this.follow_area()
    this.scroll_to_bottom()
  }

  this.events.on( "output_added.OutputArea", this.scroll_to_bottom.bind( this ) )
}

const unscroll_area = OutputArea.prototype.unscroll_area
OutputArea.prototype.unscroll_area = function () {
  this.element.find( "[data-action]" ).remove()
  this.events.off( "output_added.OutputArea", this.scroll_to_bottom.bind( this ) )

  unscroll_area.call( this )
}

/**
 * Setup UI
 *
 * @export
 */
export function setup() {
  if ( _.isUndefined( Jupyter.notebook.metadata.follow_output ) ) {
    Jupyter.notebook.metadata.follow_output = true
  }

  config.register_actions()
  config.create_menu_items()
}