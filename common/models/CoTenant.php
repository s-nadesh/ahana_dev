<?php

namespace common\models;

use common\models\query\CoTenantQuery;
use Yii;
use yii\db\ActiveQuery;
use yii\db\Connection;
use yii\helpers\ArrayHelper;

/**
 * This is the model class for table "co_tenant".
 *
 * @property integer $tenant_id
 * @property integer $org_id
 * @property string $tenant_guid
 * @property string $tenant_name
 * @property string $tenant_address
 * @property integer $tenant_city_id
 * @property integer $tenant_state_id
 * @property integer $tenant_country_id
 * @property string $tenant_contact1
 * @property string $tenant_contact2
 * @property string $tenant_fax
 * @property string $tenant_mobile
 * @property string $tenant_email
 * @property string $tenant_url
 * @property string $slug
 * @property string $status
 * @property integer $created_by
 * @property string $created_at
 * @property integer $modified_by
 * @property string $modified_at
 *
 * @property CoRole[] $coRoles
 * @property CoUser[] $coUserProfiles
 */
class CoTenant extends GActiveRecord {

    /**
     * @inheritdoc
     */
    public static function tableName() {
        return 'co_tenant';
    }

    /**
     * @inheritdoc
     */
    public function rules() {
        return [
                [['tenant_name', 'tenant_address', 'tenant_country_id', 'tenant_state_id', 'tenant_city_id', 'tenant_contact1', 'tenant_email'], 'required'],
                [['tenant_city_id', 'tenant_state_id', 'tenant_country_id', 'created_by', 'modified_by', 'org_id', 'pharmacy_setup'], 'integer'],
                [['status'], 'string'],
                [['tenant_email'], 'email', 'message' => 'Invalid Email Format'],
                [['tenant_url'], 'url', 'message' => 'Invalid Website Format'],
                [['created_at', 'modified_at', 'org_id'], 'safe'],
                [['tenant_guid', 'tenant_name', 'tenant_fax', 'tenant_email', 'tenant_url', 'slug'], 'string', 'max' => 50],
                [['tenant_address'], 'string', 'max' => 100],
                [['tenant_contact1', 'tenant_contact2', 'tenant_mobile'], 'string', 'max' => 20],
                [['tenant_name'], 'unique', 'targetAttribute' => ['org_id', 'tenant_name'], 'message' => 'The combination of Branch Name has already been taken.']
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels() {
        return [
            'tenant_id' => 'ID',
            'tenant_guid' => 'Guid',
            'tenant_name' => 'Organization Name',
            'tenant_address' => 'Organization Address',
            'tenant_city_id' => 'City',
            'tenant_state_id' => 'State',
            'tenant_country_id' => 'Country',
            'tenant_contact1' => 'Contact1',
            'tenant_contact2' => 'Contact2',
            'tenant_fax' => 'Fax',
            'tenant_mobile' => 'Mobile',
            'tenant_email' => 'Email',
            'tenant_url' => 'Url',
            'slug' => 'Slug',
            'status' => 'Status',
            'pharmacy_setup' => 'Pharmacy Setup',
            'created_by' => 'Created By',
            'created_at' => 'Created At',
            'modified_by' => 'Modified By',
            'modified_at' => 'Modified At',
        ];
    }

    /**
     * @return ActiveQuery
     */
    public function getCoRoles() {
        return $this->hasMany(CoRole::className(), ['tenant_id' => 'tenant_id']);
    }

    /**
     * @return ActiveQuery
     */
    public function getCoUsers() {
        return $this->hasMany(CoUser::className(), ['tenant_id' => 'tenant_id']);
    }

    public function getCoMasterCity() {
        return $this->hasOne(CoCity::className(), ['city_id' => 'tenant_city_id']);
    }

    public function getCoMasterState() {
        return $this->hasOne(CoState::className(), ['state_id' => 'tenant_state_id']);
    }

    public function getCoMasterCountry() {
        return $this->hasOne(CoCountry::className(), ['country_id' => 'tenant_country_id']);
    }

    public function getCoOrganization() {
        return $this->hasOne(CoOrganization::className(), ['org_id' => 'org_id']);
    }

    public function fields() {
        $extend = [
            'tenant_city_name' => function ($model) {
                return (isset($model->coMasterCity) ? $model->coMasterCity->city_name : '-');
            },
            'tenant_state_name' => function ($model) {
                return (isset($model->coMasterState) ? $model->coMasterState->state_name : '-');
            },
            'tenant_country_name' => function ($model) {
                return (isset($model->coMasterCountry) ? $model->coMasterCountry->country_name : '-');
            },
            'branch_id' => function ($model) {
                return $model->tenant_id;
            },
            'branch_name' => function ($model) {
                return $model->tenant_name;
            }
        ];
        $fields = array_merge(parent::fields(), $extend);
        return $fields;
    }

    public static function find() {
        return new CoTenantQuery(get_called_class());
    }

    public static function getTenantlist($condition = []) {
        return ArrayHelper::map(self::find()->status()->all($condition), 'tenant_id', 'tenant_name');
    }

    public function afterSave($insert, $changedAttributes) {
        $conn_dsn = "mysql:host={$this->coOrganization->org_db_host};dbname={$this->coOrganization->org_database}";
        $conn_username = $this->coOrganization->org_db_username;
        $conn_password = $this->coOrganization->org_db_password;

        $connection = new Connection([
            'dsn' => $conn_dsn,
            'username' => $conn_username,
            'password' => $conn_password,
        ]);
        $connection->open();
        if ($insert) {
            $sql = "INSERT INTO co_tenant VALUES({$this->tenant_id},'{$this->org_id}','{$this->tenant_guid}','{$this->tenant_name}','{$this->tenant_address}','{$this->tenant_city_id}','{$this->tenant_state_id}','{$this->tenant_country_id}','{$this->tenant_contact1}','{$this->tenant_contact2}','{$this->tenant_fax}','{$this->tenant_mobile}','{$this->tenant_email}','{$this->tenant_url}','{$this->slug}','{$this->status}','{$this->created_by}','{$this->created_at}','{$this->modified_by}','{$this->modified_at}','{$this->deleted_at}')";
        } else {
            $sql = "UPDATE co_tenant SET tenant_name = '{$this->tenant_name}', tenant_address = '{$this->tenant_address}', tenant_city_id = '{$this->tenant_city_id}', tenant_state_id = '{$this->tenant_state_id}', tenant_country_id = '{$this->tenant_country_id}', tenant_contact1 = '{$this->tenant_contact1}', tenant_contact2 = '{$this->tenant_contact2}', tenant_fax = '{$this->tenant_fax}', tenant_mobile = '{$this->tenant_mobile}', tenant_email = '{$this->tenant_email}', tenant_url = '{$this->tenant_url}', slug = '{$this->slug}', status = '{$this->status}', modified_by = '{$this->modified_by}', modified_at = '{$this->modified_at}', deleted_at = '{$this->deleted_at}' WHERE tenant_id={$this->tenant_id}";
        }
        $command = $connection->createCommand($sql);
        $command->execute();
        $connection->close();
        
        Yii::$app->client->dsn = $conn_dsn;
        Yii::$app->client->username = $conn_username;
        Yii::$app->client->password = $conn_password;
        
        if ($insert) {
            //Internal code.
            $code_types = CoInternalCode::getCodeTypes();
            foreach ($code_types as $code_type) {
                $internal_code = new CoInternalCode;
                $internal_code->tenant_id = $this->tenant_id;
                $internal_code->code_type = $code_type;
                $string = str_replace(' ', '-', $this->tenant_name);
                $string = preg_replace('/[^A-Za-z0-9\-]/', '', $string);
                $internal_code->code_prefix = strtoupper(substr($string, 0, 2));
                $internal_code->code = '1';
                $internal_code->save(false);
            }

            //Application configuration.
            $app_configurations = AppConfiguration::getConfigurations();
            foreach ($app_configurations as $key => $app_configuration) {
                $configuration = new AppConfiguration;
                $configuration->tenant_id = $this->tenant_id;
                $configuration->key = $key;
                $configuration->code = $app_configuration['code'];
                $configuration->value = $app_configuration['value'];
                $configuration->notes = $app_configuration['notes'];
                if (isset($app_configuration['group'])) {
                    $configuration->group = $app_configuration['group'];
                }
                $configuration->save(false);
            }

            //Tenant Case history Documents
            $tenant_doc_types = PatDocumentTypes::getTenantDocumentTypes();
            foreach ($tenant_doc_types as $key => $tenant_doc_type) {
                $tenant_doc_types = new PatDocumentTypes;
                $tenant_doc_types->tenant_id = $this->tenant_id;
                $tenant_doc_types->doc_type = $key;
                $tenant_doc_types->doc_type_name = $tenant_doc_type['doc_type_name'];
                $tenant_doc_types->document_xml = $tenant_doc_type['document_xml'];
                $tenant_doc_types->document_xslt = $tenant_doc_type['document_xslt'];
                $tenant_doc_types->document_out_xslt = $tenant_doc_type['document_out_xslt'];
                $tenant_doc_types->document_out_print_xslt = $tenant_doc_type['document_out_print_xslt'];
                $tenant_doc_types->save(false);
            }

            //Tenant medical Case history Documents
            $tenant_doc_types = PatDocumentTypes::getTenantmedicalDocumentTypes();
            foreach ($tenant_doc_types as $key => $tenant_doc_type) {
                $tenant_doc_types = new PatDocumentTypes;
                $tenant_doc_types->tenant_id = $this->tenant_id;
                $tenant_doc_types->doc_type = $key;
                $tenant_doc_types->doc_type_name = $tenant_doc_type['doc_type_name'];
                $tenant_doc_types->document_xml = $tenant_doc_type['document_xml'];
                $tenant_doc_types->document_xslt = $tenant_doc_type['document_xslt'];
                $tenant_doc_types->document_out_xslt = $tenant_doc_type['document_out_xslt'];
                $tenant_doc_types->document_out_print_xslt = $tenant_doc_type['document_out_print_xslt'];
                $tenant_doc_types->save(false);
            }
        }

        return parent::afterSave($insert, $changedAttributes);
    }

}
