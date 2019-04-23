<?php
namespace Pop\Ui\Http\Event;

use Pop\Application;

class Options
{

    /**
     * Method to send options
     *
     * @param  Application $application
     * @return void
     */
    public static function check(Application $application)
    {
        if (($application->router()->hasController()) &&
            (null !== $application->router()->getController()->request()) &&
            ($application->router()->getController()->request()->isOptions()) &&
            method_exists($application->router()->getController(), 'sendOptions')) {
            $application->router()->getController()->sendOptions(200, 'OK', $application->config['http_options_headers']);
            exit();
        }
    }

}