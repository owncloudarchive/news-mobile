/**
 *
 * ownCloud - News
 *
 * @author Ilija Lazarevic
 * @copyright 2013 Ilija Lazarevic ikac.ikax@gmail.com
 *
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU AFFERO GENERAL PUBLIC LICENSE
 * License as published by the Free Software Foundation; either
 * version 3 of the License, or any later version.
 *
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU AFFERO GENERAL PUBLIC LICENSE for more details.
 *
 * You should have received a copy of the GNU Affero General Public
 * License along with this library.  If not, see <http://www.gnu.org/licenses/>.
 */

angular.module('News').directive('scrollTo',  function () {
    return {
        restrict:'A',
        link: function (scope, element, attrs) {
            element.bind('click', function (event) {

                event.stopPropagation();
                //scope.$on('$locationChangeStart', function (ev) {
                //    ev.preventDefault();
                //});
                var scrollto = attrs.scrollto;

                //$location.hash(location);
                //$anchorScroll(); //For scrolling without animation
                $('html,body').animate({ scrollTop: $('#'+scrollto).offset().top }, { duration: 'slow', easing: 'swing'});

            });
        }
    };
});
