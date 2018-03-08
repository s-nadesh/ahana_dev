<?php

namespace common\models;

use yii\base\Model;

/**
 * This is the model class for table "co_user".
 *
 * @property integer $user_id
 * @property integer $tenant_id
 * @property string $title_code
 * @property string $name
 * @property string $designation
 * @property string $address
 * @property integer $city_id
 * @property integer $state_id
 * @property string $zip
 * @property integer $country_id
 * @property string $contact1
 * @property string $contact2
 * @property string $mobile
 * @property string $email
 * @property integer $speciality_id
 * @property string $care_provider
 * @property string $status
 * @property integer $created_by
 * @property string $created_at
 * @property integer $modified_by
 * @property string $modified_at
 * @property string $deleted_at
 *
 * @property CoLogin[] $coLogins
 * @property CoTenant $tenant
 */
class CoUserForm extends Model {

    public $user_id;
    public $tenant_id;
    public $title_code;
    public $name;
    public $designation;
    public $address;
    public $city_id;
    public $state_id;
    public $zip;
    public $country_id;
    public $contact1;
    public $contact2;
    public $mobile;
    public $email;
    public $speciality_id;
    public $care_provider;
    public $status;
    public $created_by;
    public $created_at;
    public $modified_by;
    public $modified_at;
    public $deleted_at;

    const STATUS_ACTIVE = '1';
    const STATUS_INACTIVE = '0';

    /**
     * @inheritdoc
     */
    public function rules() {
        return [
            [['name'], 'required'],
            [['email'], 'email', 'message' => 'Invalid Email Format'],
            [['title_code', 'name', 'designation', 'mobile', 'email', 'address', 'country_id', 'state_id', 'city_id', 'zip'], 'required', 'on' => 'saveorg'],
            [['tenant_id', 'city_id', 'state_id', 'country_id', 'speciality_id', 'created_by', 'modified_by'], 'integer'],
            [['title_code', 'care_provider', 'status'], 'string'],
            [['created_at', 'modified_at', 'deleted_at'], 'safe'],
            [['name', 'contact1', 'contact2', 'mobile', 'email'], 'string', 'max' => 50],
            [['designation'], 'string', 'max' => 25],
            [['address'], 'string', 'max' => 100],
            [['zip'], 'string', 'max' => 20]
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels() {
        return [
            'user_id' => 'User ID',
            'tenant_id' => 'Tenant ID',
            'title_code' => 'Prefix',
            'name' => 'Name',
            'designation' => 'Designation',
            'address' => 'Address',
            'city_id' => 'City',
            'state_id' => 'State',
            'zip' => 'Zip',
            'country_id' => 'Country',
            'contact1' => 'Contact1',
            'contact2' => 'Contact2',
            'mobile' => 'Mobile',
            'email' => 'Email',
            'speciality_id' => 'Speciality',
            'care_provider' => 'Care Provider',
            'status' => 'Status',
            'created_by' => 'Created By',
            'created_at' => 'Created At',
            'modified_by' => 'Modified By',
            'modified_at' => 'Modified At',
        ];
    }

}
