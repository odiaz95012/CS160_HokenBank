import React from 'react';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import { ListGroup, ListGroupItem } from 'react-bootstrap';

interface CustomerCardProps {
    customer_id: number,
    full_name: string,
    username: string,
    email: string,
    age: number,
    gender: string,
    zip_code: number,
    status: string,
}

function CustomerCard({ customer_id, full_name, username, email, age, gender, zip_code, status }: CustomerCardProps): JSX.Element {
    //latest 
    return (
        <Card style={{ width: '25rem' }}>
            <Card.Body>
                <div className='d-flex justify-content-end'>
                    <button className='btn btn-outline-primary'><i className="bi bi-file-earmark-arrow-down"></i></button>
                </div>
                <Card.Title>{full_name}</Card.Title>
                <Card.Text>
                    <ListGroup variant="flush">

                        <ListGroup.Item>Customer ID: {customer_id}</ListGroup.Item>
                        <ListGroup.Item>Username: {username}</ListGroup.Item>
                        <ListGroup.Item>Email: {email}</ListGroup.Item>
                        <ListGroup.Item>Age: {age}</ListGroup.Item>
                        <ListGroup.Item>Gender: {gender}</ListGroup.Item>
                        <ListGroup.Item>Zip Code: {zip_code}</ListGroup.Item>
                        <ListGroup.Item>Status: {status}</ListGroup.Item>
                    </ListGroup>
                </Card.Text>
                <Button variant="primary">Generate User Report</Button>
            </Card.Body>
        </Card>
    );
}

export default CustomerCard;
