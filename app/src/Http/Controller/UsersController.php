<?php

namespace Pop\Ui\Http\Controller;

use Pop\Ui\Service\Api;
use Pop\Csv\Csv;
use Pop\Http\Client\Stream;
use Pop\Paginator\Paginator;

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

        $apiUrl        = $this->application->config['api_url'];
        $page          = (null !== $this->request->getQuery('page')) ? (int)$this->request->getQuery('page') : 1;
        $sort          = (null !== $this->request->getQuery('sort')) ? $this->request->getQuery('sort') : null;
        $filter        = (null !== $this->request->getQuery('filter')) ? $this->request->getQuery('filter') : null;
        $fields        = (null !== $this->request->getQuery('fields')) ? $this->request->getQuery('fields') : null;
        $limit         = (null !== $this->request->getQuery('limit')) ?
            (int)$this->request->getQuery('limit') : $this->application->config['limit'];
        $pageView      = (null !== $this->request->getQuery('scroll'));
        $encodedFilter = null;

        if (null !== $filter) {
            if (is_array($filter)) {
                foreach ($filter as $k => $v) {
                    $encodedFilter[$k] = urlencode($v);
                }
            } else {
                $encodedFilter = urlencode($filter);
            }
        }

        if (null !== $fields) {
            $fields = (is_array($fields)) ? implode(',', $fields) : $fields;
        }

        $this->view->title    = 'Users';
        $this->view->apiUrl   = $apiUrl . '/users';
        $this->view->page     = $page;
        $this->view->sort     = $sort;
        $this->view->filter   = $encodedFilter;
        $this->view->fields   = $fields;
        $this->view->pageView = $pageView;
        $this->view->limit    = $limit;

        if (null !== $this->request->getQuery('scroll')) {
            $api = new Api(new Stream($apiUrl . '/users/count'));

            if (null !== $filter) {
                $api->createQuery(null, $filter, null);
            } else if (!empty($this->request->getQuery('search_by')) && !empty($this->request->getQuery('search_for'))) {
                $query = 'filter[]=' . $this->request->getQuery('search_by') . '+LIKE+' .
                    $this->request->getQuery('search_for') . '%25';
                $api->appendQuery($query);
            }

            $api->send();

            if ($api->hasResponse()) {
                $users     = $api->getResponse();
                $paginator = Paginator::createRange($users['results_count'], $limit, 10);
                $paginator->setClassOn('page-link')
                          ->setClassOff('page-link');
                $paginator->setSeparator(PHP_EOL . '        ');
                $paginator->wrapLinks('li', 'page-item', 'page-item active');

                $this->view->paginator = $paginator;
            }
        }

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

        $api = new Api(new Stream($apiUrl));
        $api->createQuery($sort, $filter, $fields);
        $api->send();

        if ($api->hasResponse()) {
            $users = $api->getResponse();
            if (isset($users['results'])) {
                Csv::outputDataToHttp($users['results'], [], 'users.csv');
            }
        }
    }

}