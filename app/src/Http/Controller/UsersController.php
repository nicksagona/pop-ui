<?php

namespace Pop\Ui\Http\Controller;

class UsersController extends AbstractController
{

    /**
     * Index action
     *
     * @return void
     */
    public function index()
    {
        $this->prepareView('users.phtml');

        $this->view->title    = 'Users';
        $this->view->page     = (null !== $this->request->getQuery('page')) ? (int)$this->request->getQuery('page') : 1;
        $this->view->sort     = (null !== $this->request->getQuery('sort')) ? $this->request->getQuery('sort') : null;
        $this->view->filter   = (null !== $this->request->getQuery('filter')) ? $this->request->getQuery('filter') : [];
        $this->view->fields   = (null !== $this->request->getQuery('fields')) ? $this->request->getQuery('fields') : [];
        $this->view->limit    = (null !== $this->request->getQuery('limit')) ?
            (int)$this->request->getQuery('limit') : $this->application->config['limit'];

        $this->send();
    }

    /**
     * Export action
     *
     * @return void
     */
    public function export()
    {

    }

}