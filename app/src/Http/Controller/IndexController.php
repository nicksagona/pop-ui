<?php

namespace Pop\Ui\Http\Controller;

use Pop\Csv\Csv;

class IndexController extends AbstractController
{

    /**
     * Index action
     *
     * @return void
     */
    public function index()
    {
        $this->prepareView('index.phtml');
        $this->view->title = 'Pop UI';

        $this->send();
    }

    /**
     * Export action
     *
     * @return void
     */
    public function export()
    {
        $this->prepareView('index.phtml');
        $this->view->title = 'Pop UI : Export';

        $this->send();
    }

    /**
     * Error action
     *
     * @return void
     */
    public function error()
    {
        $this->prepareView('error.phtml');
        $this->view->title = 'Error';
        $this->send(404);
    }

}