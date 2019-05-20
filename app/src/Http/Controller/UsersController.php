<?php

namespace Pop\Ui\Http\Controller;

use Pop\Csv\Csv;
use Pop\Http\Client\Stream;

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

        $filter = (null !== $this->request->getQuery('filter')) ? $this->request->getQuery('filter') : null;
        $fields = (null !== $this->request->getQuery('fields')) ? $this->request->getQuery('fields') : null;

        if (null !== $filter) {
            if (is_array($filter)) {
                foreach ($filter as $k => $v) {
                    $filter[$k] = urlencode($v);
                }
            } else {
                $filter = urlencode($filter);
            }
        }

        if (null !== $fields) {
            $fields = (is_array($fields)) ? implode(',', $fields) : $fields;
        }

        $this->view->title  = 'Users';
        $this->view->apiUrl = $this->application->config['api_url'] . '/users';
        $this->view->page   = (null !== $this->request->getQuery('page')) ? (int)$this->request->getQuery('page') : 1;
        $this->view->sort   = (null !== $this->request->getQuery('sort')) ? $this->request->getQuery('sort') : null;
        $this->view->filter = $filter;
        $this->view->fields = $fields;
        $this->view->limit  = (null !== $this->request->getQuery('limit')) ?
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
        $apiUrl = $this->application->config['api_url'] . '/users';
        $sort   = (null !== $this->request->getQuery('sort')) ? $this->request->getQuery('sort') : null;
        $filter = (null !== $this->request->getQuery('filter')) ? $this->request->getQuery('filter') : null;
        $fields = (null !== $this->request->getQuery('fields')) ? $this->request->getQuery('fields') : null;
        $query  = [];

        if (null !== $sort) {
            $query['sort'] = $sort;
        }

        if (null !== $filter) {
            $query['filter'] = [];
            if (is_array($filter)) {
                foreach ($filter as $f) {
                    $query['filter'] = $f;
                }
            } else {
                $query['filter'] = $filter;
            }
        }

        if (null !== $fields) {
            $query['fields'] = (is_array($fields)) ? implode(',', $fields) : $fields;
        }

        if (!empty($query)) {
            $apiUrl .= '?' . http_build_query($query);
        }

        $stream = new Stream($apiUrl);
        $stream->send();

        if (!empty($stream->getBody())) {
            $users = json_decode($stream->getBody(), true);
            if (isset($users['results'])) {
                Csv::outputDataToHttp($users['results'], [], 'users.csv');
            }
        }
    }

}