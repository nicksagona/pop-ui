<?php

namespace Pop\Ui;

use Pop\Application;
use Pop\Http\Request;
use Pop\Http\Response;
use Pop\View\View;

class Module extends \Pop\Module\Module
{

    /**
     * Module name
     * @var string
     */
    protected $name = 'pop-ui';

    /**
     * Register module
     *
     * @param  Application $application
     * @return Module
     */
    public function register(Application $application)
    {
        parent::register($application);

        if (null !== $this->application->router()) {
            $this->application->router()->addControllerParams(
                '*', [
                    'application' => $this->application,
                    'request'     => new Request(),
                    'response'    => new Response()
                ]
            );
        }

        if (!empty($this->application->config['api_key'])) {
            $this->application->setService('cookie', 'Pop\Cookie\Cookie::getInstance');
            $cookie = $this->application->services['cookie'];
            if (!isset($cookie['api_key'])) {
                $cookie['api_key'] = $this->application->config['api_key'];
            }
        }

        return $this;
    }

    /**
     * HTTP error handler method
     *
     * @param  \Exception $exception
     * @return void
     */
    public function httpError(\Exception $exception)
    {
        $request  = new Request();
        $response = new Response();
        $message  = $exception->getMessage();

        if (stripos($request->getHeader('Accept'), 'text/html') !== false) {
            $view          = new View(__DIR__ . '/../view/exception.phtml');
            $view->title   = 'Exception';
            $view->message = $message;
            $response->setBody($view->render());
        } else {
            $response->setHeader('Content-Type', 'application/json');
            $response->setBody(json_encode(['error' => $message], JSON_PRETTY_PRINT) . PHP_EOL);
        }

        $response->send(500);
        exit();
    }

}