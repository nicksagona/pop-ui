<?php

namespace Pop\Ui\Service;

use Pop\Http\Client\Stream;

class Api
{

    /**
     * Stream object
     * @var Stream
     */
    protected $stream = null;

    /**
     * Constructor for the API service
     *
     * @param Stream $stream
     */
    public function __construct(Stream $stream)
    {
        $this->stream = $stream;
    }

    /**
     * Method to get stream object
     *
     * return Stream
     */
    public function getStream()
    {
        return $this->stream;
    }

    /**
     * Method to add header
     *
     * @param  string $name
     * @param  string $value
     * @return Api
     */
    public function addHeader($name, $value)
    {
        $this->stream->setRequestHeader($name, $value);
        return $this;
    }

    /**
     * Method to set query fields
     *
     * @param string $sort
     * @param mixed  $filter
     * @param string $fields
     */
    public function createQuery($sort = null, $filter = null, $fields = null)
    {
        $query = [];

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
            $this->stream->setFields($query);
        }
    }

    /**
     * Method to append query to URL
     *
     * @param string $query
     * @return Api
     */
    public function appendQuery($query)
    {
        $url  = $this->stream->getUrl();
        $url .= (strpos($url, '?') !== false) ? '&' . $query : '?' . $query;

        $this->stream->setUrl($url);

        return $this;
    }

    /**
     * Method to send API call
     *
     */
    public function send()
    {
        $this->stream->send();
    }

    /**
     * Method to determine to response has body
     *
     * return boolean
     */
    public function hasResponse()
    {
        return !empty($this->stream->getBody());
    }

    /**
     * Method to get response
     *
     * return array
     */
    public function getResponse()
    {
        return (!empty($this->stream->getBody())) ? json_decode($this->stream->getBody(), true) : [];
    }


}